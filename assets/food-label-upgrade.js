function stripAccents(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae');
}

function normalizeRaw(value) {
  return stripAccents(String(value || ''))
    .toLowerCase()
    .replace(/&quot;/g, ' ')
    .replace(/[–—]/g, ' ')
    .replace(/[%/()+,.:;\-]/g, ' ')
    .replace(/[^0-9a-z\u4e00-\u9fff]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanupZh(value) {
  return String(value || '')
    .replace(/&quot;/g, '')
    .replace(/\s+/g, ' ')
    .replace(/(?<=[\u4e00-\u9fff])\s+(?=[\u4e00-\u9fff])/g, '')
    .replace(/^(?:\d+[.,]?\d*\s*){1,4}/, '')
    .replace(/[()（）]/g, '')
    .trim();
}

function uniq(list, value) {
  if (value && !list.includes(value)) list.push(value);
}

function has(raw, re) {
  return re.test(raw);
}

const BAD_ZH_PATTERNS = [
  /^食品$/,
  /^有机$/,
  /^熟$/,
  /^去壳$/,
  /^去骨$/,
  /^蔬菜$/,
  /^水果$/,
  /^鸡肉$/,
  /^鸡胸$/,
  /^鸡胸肉$/,
  /^鱼$/,
  /^虾$/,
  /^肉$/,
  /^酸奶$/,
  /^牛奶$/,
  /^面包$/,
  /^奶酪$/,
  /^谷物$/,
  /^果汁$/,
  /^原味$/, 
  /^切片$/, 
  /^迷你切片$/, 
  /^鱼片原味$/, 
  /^豆腐原味$/, 
  /^菠菜有机$/, 
  /^有机蔬菜$/, 
  /^有机豆豆$/, 
  /^整只有机蔬菜$/,
  /^谷物有机面包$/,
  /^原味有机面包$/,
  /^原味面包$/,
  /^原味鸡肉$/,
  /^原味牛奶$/,
  /^原味酸奶$/,
  /^原味果汁$/,
  /^生蛋糕$/,
  /^烤制鸡肉$/,
  /^烟熏鸡肉$/,
  /^烟熏火腿$/,
  /^有机火腿$/,
  /^有机猪肉$/,
  /^鸡肉碎$/,
  /^鸡胸片?$/,
  /^白鸡肉$/,
  /^白烟熏鸡肉$/,
  /^鱼片鸡肉$/,
  /^英国鸡肉$/,
  /^英国迷你鸡肉$/,
  /^碎鸡肉$/,
  /^白\d+切片鸡肉$/,
  /^白有机\d*切片鸡肉$/,
  /^鱼片\d+切片鸡肉$/,
  /^鱼片烟熏\d+切片鸡肉$/,
  /^鱼片\d+\s*\d+鸡肉$/,
  /^白有机鸡肉$/,
  /^牛奶生黄油$/,
  /^生\d+牛奶$/,
];

const NOUN_RULES = [
  { re: /(veggie\s+colin\s+the\s+caterpillar|colin\s+the\s+caterpillar|caterpillar\s+cake)/, zh: '毛毛虫蛋糕', kind: 'dessert', priority: 10 },
  { re: /(pate\s+a\s+chaussons?)/, zh: '酥皮面团', kind: 'bakery', priority: 10 },
  { re: /(chaussons?\s+tresses?\s+aux?\s+pommes?|chaussons?\s+aux?\s+pommes?|apple\s+turnovers?)/, zh: '苹果酥皮派', kind: 'bakery', priority: 10 },
  { re: /(chaussons?\s+aux?\s+poires?|pear\s+turnovers?)/, zh: '梨酥皮派', kind: 'bakery', priority: 10 },
  { re: /(chaussons?\s+au\s+thon|tuna\s+turnovers?)/, zh: '金枪鱼酥皮派', kind: 'bakery', priority: 10 },
  { re: /(financiers?)/, zh: '费南雪蛋糕', kind: 'dessert', priority: 9 },
  { re: /(madeleines?)/, zh: '玛德琳蛋糕', kind: 'dessert', priority: 9 },
  { re: /(crepes?\s+dentelle)/, zh: '薄脆可丽饼', kind: 'dessert', priority: 9 },
  { re: /(crepes?|crepe)/, zh: '可丽饼', kind: 'dessert', priority: 8 },
  { re: /(gaufres?|waffles?)/, zh: '华夫饼', kind: 'dessert', priority: 8 },
  { re: /(cake\s+aux\s+fruits?|fruit\s+cake)/, zh: '水果蛋糕', kind: 'dessert', priority: 9 },
  { re: /(veloute)/, zh: '浓汤', kind: 'meal', priority: 8 },
  { re: /(roti\s+de\s+boeuf|roast\s+beef)/, zh: '烤牛肉', kind: 'protein', priority: 9 },
  { re: /(cocktail\s+de\s+fruits\s+de\s+mer|seafood\s+cocktail)/, zh: '海鲜拼盘', kind: 'seafood', priority: 9 },
  { re: /(filets?\s+de\s+hareng\s+fumes?|smoked\s+herring\s+fillets?)/, zh: '烟熏鲱鱼柳', kind: 'seafood', priority: 9 },
  { re: /(salad\s+cream)/, zh: '沙拉酱', kind: 'condiment', priority: 9 },
  { re: /(caesar\s+dressing|sauce\s+caesar|caesar\s+sauce)/, zh: '凯撒沙拉酱', kind: 'condiment', priority: 9 },
  { re: /(salade\s+chicken\s+caesar|chicken\s+caesar\s+salad|salad.*caesar.*chicken|caesar.*chicken.*salad|poulet\s+caesar)/, zh: '鸡肉凯撒沙拉', kind: 'meal', priority: 9 },
  { re: /(boisson\s+au\s+soja.*calcium|soy\s+drink.*calcium|soy\s+milk.*calcium|calcium.*soy\s+drink)/, zh: '高钙豆奶饮料', kind: 'drink', priority: 10 },
  { re: /(boisson\s+au\s+soja|soy\s+drink|soy\s+milk|lait\s+de\s+soja)/, zh: '豆奶饮料', kind: 'drink', priority: 9 },
  { re: /(peanut\s+butter|beurre\s+d\s*arachide)/, zh: '花生酱', kind: 'condiment', priority: 9 },
  { re: /(mousse.*fromage\s+frais|fromage\s+frais.*mousse)/, zh: '奶油奶酪慕斯', kind: 'dessert', priority: 10 },
  { re: /(flan.*fromage\s+frais|fromage\s+frais.*flan)/, zh: '奶油奶酪布丁', kind: 'dessert', priority: 10 },
  { re: /(english\s+muffin.*cheese|cheese.*english\s+muffin|fromage.*muffin\s+anglais)/, zh: '奶酪英式松饼', kind: 'bakery', priority: 9 },
  { re: /(cottage\s+cheese)/, zh: '茅屋奶酪', kind: 'dairy', priority: 9 },
  { re: /(whole\s+milk\s+cheese)/, zh: '全脂奶酪', kind: 'dairy', priority: 9 },
  { re: /(goat\s+milk\s+cheese)/, zh: '山羊奶酪', kind: 'dairy', priority: 9 },
  { re: /(soft\s+cheese)/, zh: '软质奶酪', kind: 'dairy', priority: 8 },
  { re: /(cheese\s+crackers?|crackers?.*cheese)/, zh: '奶酪味薄脆饼干', kind: 'snack', priority: 8 },
  { re: /(creme\s+de\s+marrons?)/, zh: '栗子酱', kind: 'dessert', priority: 9 },
  { re: /(puree\s+de\s+marrons?)/, zh: '栗子泥', kind: 'dessert', priority: 9 },
  { re: /(marrons?\s+glaces?|marron\s+glace)/, zh: '糖渍栗子', kind: 'dessert', priority: 9 },
  { re: /(marrons?\s+cuits?|chataigne|chestnut)/, zh: '栗子', kind: 'produce', priority: 7 },
  { re: /(pate\s+au\s+poulet|chicken\s+pie)/, zh: '鸡肉派', kind: 'meal', priority: 10 },
  { re: /(pate\s+lorrain)/, zh: '洛林肉派', kind: 'meal', priority: 10 },
  { re: /(pate\s+de\s+foie|foie\s+pate)/, zh: '肝酱', kind: 'protein', priority: 9 },
  { re: /(pate\s+de\s+piment)/, zh: '辣椒酱', kind: 'condiment', priority: 9 },
  { re: /(spaghetti\s+sauce|pasta\s+sauce)/, zh: '意面酱', kind: 'condiment', priority: 8 },
  { re: /(tomato\s+paste)/, zh: '番茄膏', kind: 'condiment', priority: 9 },
  { re: /(tomato\s+puree|puree\s+de\s+tomates?)/, zh: '番茄泥', kind: 'condiment', priority: 9 },
  { re: /(poires?\s+demi\s+fruits?|pear\s+halves?)/, zh: '梨半颗', kind: 'produce', priority: 9 },
  { re: /(peches?\s+demi\s+fruits?|peaches?\s+halves?)/, zh: '桃半颗', kind: 'produce', priority: 9 },
  { re: /(ananas\s+en\s+morceaux|pineapple\s+chunks?)/, zh: '菠萝块', kind: 'produce', priority: 9 },
  { re: /(tranches?\s+d\s*ananas|pineapple\s+slices?)/, zh: '菠萝片', kind: 'produce', priority: 9 },
  { re: /(cocktail\s+de\s+fruits(?!\s+de\s+mer)|fruit\s+cocktail)/, zh: '什锦水果', kind: 'produce', priority: 9 },
  { re: /(melange\s+de\s+fruits?\s+tropicaux|mixed\s+tropical\s+fruits?)/, zh: '热带水果混合', kind: 'produce', priority: 9 },
  { re: /(macaroni\s*n\s*'?\s*cheese|macaroni\s*&\s*cheese|mac\s*n\s*cheese|macaroni\s+and\s+cheese|macaroni\s+cheese|mac\s+cheese)/, zh: '芝士通心粉', kind: 'meal', priority: 6 },
  { re: /(ice\s+cream\s+sandwich)/, zh: '三明治冰淇淋', kind: 'dessert', priority: 6 },
  { re: /(cheeseburgers?)/, zh: '芝士汉堡', kind: 'meal', priority: 6 },
  { re: /(pizza\s+bases?|pizza\s+base)/, zh: '披萨饼底', kind: 'bakery', priority: 6 },
  { re: /(cheese\s+pizza|pizza\s+au\s+fromage|four\s+cheese\s+pizza|5\s+cheese.*pizza|cheesy\s+pizza)/, zh: '奶酪披萨', kind: 'meal', priority: 6 },
  { re: /(pizza.*kebab|kebab.*pizza)/, zh: '烤肉披萨', kind: 'meal', priority: 6 },
  { re: /(pizza.*thon|thon.*pizza|pizza.*tonno|tonno.*pizza)/, zh: '金枪鱼披萨', kind: 'meal', priority: 6 },
  { re: /(spinach.*ricotta.*pizza|pizza.*ricotta.*spinach|pizza.*epinards?.*ricotta)/, zh: '菠菜里科塔奶酪披萨', kind: 'meal', priority: 6 },
  { re: /(burger\s+sauce|burger\s+mayo|youburger)/, zh: '汉堡酱', kind: 'condiment', priority: 6 },
  { re: /(\bburger\b(?!\s+buns?)|\bhamburger\b(?!\s+(?:enriched\s+)?buns?))/, zh: '汉堡', kind: 'meal', priority: 4 },
  { re: /(pain\s+sandwich|pain\s+de\s+mie\s+special\s+sandwich|sandwich\s+bread|special\s+sandwich)/, zh: '三明治面包', kind: 'bakery', priority: 6 },
  { re: /(sandwich.*thon|thon.*sandwich)/, zh: '金枪鱼三明治', kind: 'meal', priority: 6 },
  { re: /(sandwich.*jambon|jambon.*sandwich)/, zh: '火腿三明治', kind: 'meal', priority: 6 },
  { re: /(sandwich.*oeuf|oeuf.*sandwich)/, zh: '鸡蛋三明治', kind: 'meal', priority: 6 },
  { re: /(sandwich.*poulet|poulet.*sandwich)/, zh: '鸡肉三明治', kind: 'meal', priority: 6 },
  { re: /(mcwrap\s+chevre|wrap.*chevre|chevre.*wrap)/, zh: '山羊奶酪卷饼', kind: 'meal', priority: 6 },
  { re: /(mcwrap\s+crevette|wrap.*crevette|crevette.*wrap)/, zh: '虾肉卷饼', kind: 'meal', priority: 6 },
  { re: /(mcwrap\s+poulet|wrap.*poulet|poulet.*wrap)/, zh: '鸡肉卷饼', kind: 'meal', priority: 6 },
  { re: /(quiche\s+lorraine)/, zh: '洛林咸派', kind: 'meal', priority: 6 },
  { re: /(smoked\s+salmon.*quiche|quiche.*saumon|saumon.*quiche)/, zh: '三文鱼咸派', kind: 'meal', priority: 6 },
  { re: /(sandwiches?|croque\s*monsieur|club\s+sandwich)/, zh: '三明治', kind: 'meal', priority: 5 },
  { re: /(fruit\s+wraps?|fruit\s+rolls?)/, zh: '果卷', kind: 'snack', priority: 5 },
  { re: /(wraps?)/, zh: '卷饼', kind: 'meal', priority: 5 },
  { re: /(quiches?)/, zh: '咸派', kind: 'meal', priority: 5 },
  { re: /(lasagnes?|lasagna)/, zh: '千层面', kind: 'meal', priority: 5 },
  { re: /(enchiladas?)/, zh: '墨西哥烤玉米卷', kind: 'meal', priority: 5 },
  { re: /(burritos?)/, zh: '墨西哥卷饼', kind: 'meal', priority: 5 },
  { re: /(falafels?)/, zh: '法拉费', kind: 'meal', priority: 5 },
  { re: /(kebabs?|doner|gyros?)/, zh: '烤肉', kind: 'meal', priority: 5 },
  { re: /(curry\s+paste|pate\s+de\s+curry|pasta\s+de\s+curry)/, zh: '咖喱膏', kind: 'condiment', priority: 6 },
  { re: /(curry\s+sauce|sauce\s+.*curry)/, zh: '咖喱酱', kind: 'condiment', priority: 6 },
  { re: /(green\s+curry|curry\s+vert)/, zh: '绿咖喱', kind: 'meal', priority: 5 },
  { re: /(chicken\s+curry|curry\s+chicken|poulet\s+au\s+curry)/, zh: '鸡肉咖喱', kind: 'meal', priority: 5 },
  { re: /(christmas\s+pudding)/, zh: '圣诞布丁', kind: 'dessert', priority: 6 },
  { re: /(panna\s+cotta)/, zh: '意式奶冻', kind: 'dessert', priority: 6 },
  { re: /(tiramisu)/, zh: '提拉米苏', kind: 'dessert', priority: 6 },
  { re: /(cheesecakes?)/, zh: '芝士蛋糕', kind: 'dessert', priority: 6 },
  { re: /(brownies?)/, zh: '布朗尼', kind: 'dessert', priority: 5 },
  { re: /(ice\s+cream|icecream)/, zh: '冰淇淋', kind: 'dessert', priority: 5 },
  { re: /(gelato)/, zh: '意式冰淇淋', kind: 'dessert', priority: 5 },
  { re: /(sorbets?)/, zh: '雪葩', kind: 'dessert', priority: 5 },
  { re: /(custard|flan|puddings?)/, zh: '布丁', kind: 'dessert', priority: 5 },
  { re: /(mousse\s+au\s+chocolat|chocolate\s+mousse)/, zh: '巧克力慕斯', kind: 'dessert', priority: 6 },
  { re: /(mousses?)/, zh: '慕斯', kind: 'dessert', priority: 5 },
  { re: /(granola\s+bars?|barres?\s+tendres?\s+granola)/, zh: '格兰诺拉麦片棒', kind: 'snack', priority: 6 },
  { re: /(granola)/, zh: '格兰诺拉麦片', kind: 'snack', priority: 5 },
  { re: /(muesli|musli|muesli)/, zh: '混合麦片', kind: 'snack', priority: 6 },
  { re: /(corn\s+flakes|frosted\s+flakes|flakes\s+de\s+mais)/, zh: '玉米片', kind: 'snack', priority: 6 },
  { re: /(cheerios?)/, zh: '麦圈谷物', kind: 'snack', priority: 6 },
  { re: /(cereal\s+bars?|barres?\s+de\s+cereales?)/, zh: '谷物棒', kind: 'snack', priority: 6 },
  { re: /(oatmeal|porridge\s+oats?|porridge)/, zh: '燕麦片', kind: 'snack', priority: 5 },
  { re: /(cereals?|multi\s*grain\s+cereal)/, zh: '早餐谷物', kind: 'snack', priority: 4 },
  { re: /(bread\s+flour|farine\s+de\s+pain)/, zh: '面包粉', kind: 'bakery', priority: 6 },
  { re: /(english\s+muffin|muffin\s+anglais)/, zh: '英式松饼', kind: 'bakery', priority: 6 },
  { re: /(crispbread)/, zh: '脆面包片', kind: 'bakery', priority: 6 },
  { re: /(sourdough)/, zh: '酸种面包', kind: 'bakery', priority: 5 },
  { re: /(light\s+rye|rye\s+bread)/, zh: '黑麦面包', kind: 'bakery', priority: 5 },
  { re: /(white\s+enriched\s+bread|white\s+bread)/, zh: '白面包', kind: 'bakery', priority: 5 },
  { re: /(coconut\s+milk|lait\s+de\s+coco|kokosnussmilch|leche\s+de\s+coco)/, zh: '椰奶', kind: 'drink', priority: 6 },
  { re: /(coconut\s+juice|jus\s+de\s+coco)/, zh: '椰子汁', kind: 'drink', priority: 6 },
  { re: /(tomato\s+juice|jus\s+de\s+tomate)/, zh: '番茄汁', kind: 'drink', priority: 6 },
  { re: /(guava\s+juice|jus\s+de\s+goyave|boisson\s+a\s+base\s+de\s+jus\s+de\s+goyave)/, zh: '番石榴汁', kind: 'drink', priority: 6 },
  { re: /(lychee\s+juice|jus\s+de\s+litchi|boisson\s+a\s+base\s+de\s+jus\s+de\s+litchi)/, zh: '荔枝汁', kind: 'drink', priority: 6 },
  { re: /(orange\s+juice|jus\s+d\s*orange)/, zh: '橙汁', kind: 'drink', priority: 6 },
  { re: /(apple\s+juice|jus\s+d\s*pomme)/, zh: '苹果汁', kind: 'drink', priority: 6 },
  { re: /(grapefruit\s+juice|jus\s+de\s+pamplemousse)/, zh: '西柚汁', kind: 'drink', priority: 6 },
  { re: /(pineapple\s+slices?|tranches?\s+d\s*ananas)/, zh: '菠萝片', kind: 'produce', priority: 6 },
  { re: /(pineapple\s+chunks?|morceaux\s+d\s*ananas)/, zh: '菠萝块', kind: 'produce', priority: 6 },
  { re: /(pear\s+halves?)/, zh: '梨半颗', kind: 'produce', priority: 6 },
  { re: /(fruit\s+cocktail)/, zh: '什锦水果', kind: 'produce', priority: 6 },
  { re: /(peeled\s+plum\s+tomatoes?)/, zh: '去皮整番茄', kind: 'produce', priority: 7 },
  { re: /(plum\s+tomatoes?)/, zh: '整番茄', kind: 'produce', priority: 6 },
  { re: /(orzo)/, zh: '米粒形意面', kind: 'meal', priority: 6 },
  { re: /(risotto\s+rice|arborio\s+risotto\s+rice|riz\s+pour\s+risotto|riz\s+risotto)/, zh: '烩饭米', kind: 'produce', priority: 6 },
  { re: /(risotto)/, zh: '意式烩饭', kind: 'meal', priority: 5 },
  { re: /(couscous)/, zh: '库斯库斯', kind: 'meal', priority: 6 },
  { re: /(macaroni|elbows?\s+macaroni)/, zh: '通心粉', kind: 'bakery', priority: 5 },
  { re: /(goat'?s\s+cheese|fromage\s+de\s+chevre|fromage\s+au\s+lait\s+de\s+chevre|crottins?\s+de\s+chevre|\bchevre\b)/, zh: '山羊奶酪', kind: 'dairy', priority: 6 },
  { re: /(ricotta)/, zh: '里科塔奶酪', kind: 'dairy', priority: 6 },
  { re: /(mascarpone)/, zh: '马斯卡彭奶酪', kind: 'dairy', priority: 6 },
  { re: /(brie)/, zh: '布里奶酪', kind: 'dairy', priority: 6 },
  { re: /(camembert)/, zh: '卡芒贝尔奶酪', kind: 'dairy', priority: 6 },
  { re: /(gouda)/, zh: '高达奶酪', kind: 'dairy', priority: 6 },
  { re: /(gruyere)/, zh: '格鲁耶尔奶酪', kind: 'dairy', priority: 6 },
  { re: /(pate\s+en\s+croute)/, zh: '法式肉派', kind: 'meal', priority: 6 },
  { re: /(\bpate\b|chicken\s+pate)/, zh: '肉酱', kind: 'protein', priority: 5 },
  { re: /(haggis)/, zh: '哈吉斯', kind: 'meal', priority: 6 },
  { re: /(chicken\s+breast\s+strips?|grilled\s+chicken\s+breast\s+strips?|strips?\s+de\s+filet\s+de\s+poulet|aiguillettes?\s+de\s+poulet)/, zh: '鸡胸肉条', kind: 'protein' },
  { re: /(shredded\s+chicken\s+breast|chicken\s+breast\s+shreds?|pulled\s+chicken)/, zh: '鸡胸肉丝', kind: 'protein' },
  { re: /(nuggets?.*(chicken\s+breast|filet\s+de\s+poulet|blanc\s+de\s+poulet)|(chicken\s+breast|filet\s+de\s+poulet|blanc\s+de\s+poulet).*(nuggets?))/, zh: '鸡胸肉块', kind: 'protein' },
  { re: /(vegetarian\s+chicken\s+breast|vegan\s+chicken\s+breast)/, zh: '素鸡胸', kind: 'plant' },
  { re: /(chicken\s+breast|blanc\s+de\s+poulet|filet\s+de\s+poulet|pechuga\s+de\s+pollo|filete\s+de\s+pollo|filets?\s+de\s+poulet\s+fermier|filet\s+de\s+poulet\s+fermier)/, zh: '鸡胸肉', kind: 'protein' },
  { re: /(chicken\s+thighs?|cuisse\s+de\s+poulet|muslo\s+de\s+pollo)/, zh: '鸡腿肉', kind: 'protein' },
  { re: /(chicken\s+wings?|ailes?\s+de\s+poulet|alas?\s+de\s+pollo)/, zh: '鸡翅', kind: 'protein' },
  { re: /(grignottes?\s+de\s+poulet|chicken\s+drumsticks?)/, zh: '鸡小腿', kind: 'protein' },
  { re: /(chicken\s+stock|chicken\s+broth|bouillon\s+de\s+poulet|fond\s+de\s+volaille)/, zh: '鸡汤底', kind: 'meal' },
  { re: /(chicken\s+laksa|laksa\s+chicken)/, zh: '鸡肉叻沙', kind: 'meal' },
  { re: /(chicken\s+ramen|ramen.*chicken)/, zh: '鸡肉拉面', kind: 'meal' },
  { re: /(chicken\s+chow\s+mein|chow\s+mein.*chicken)/, zh: '鸡肉炒面', kind: 'meal' },
  { re: /(poulet\s+au\s+parmesan|chicken\s+parmesan)/, zh: '帕玛森鸡肉', kind: 'meal' },
  { re: /(poulet|pollo|chicken)/, zh: '鸡肉', kind: 'protein', priority: 2 },

  { re: /(turkey\s+breast|blanc\s+de\s+dinde|filet\s+de\s+dinde)/, zh: '火鸡胸肉', kind: 'protein' },
  { re: /(turkey|dinde|pavo)/, zh: '火鸡肉', kind: 'protein' },
  { re: /(duck\s+breast|magret\s+de\s+canard)/, zh: '鸭胸肉', kind: 'protein' },
  { re: /(duck|canard|pato)/, zh: '鸭肉', kind: 'protein' },
  { re: /(ham|jambon)/, zh: '火腿', kind: 'protein' },
  { re: /(salami)/, zh: '萨拉米香肠', kind: 'protein' },
  { re: /(sausages?|saucisses?|chipolatas?)/, zh: '香肠', kind: 'protein' },
  { re: /(lardons?|bacon)/, zh: '培根', kind: 'protein' },
  { re: /(pork\s+loin|filet\s+de\s+porc|lomo\s+de\s+cerdo)/, zh: '猪里脊', kind: 'protein' },
  { re: /(pork\s+chops?|cotes?\s+de\s+porc|chuletas?\s+de\s+cerdo)/, zh: '猪排', kind: 'protein' },
  { re: /(porc|cerdo|pork)/, zh: '猪肉', kind: 'protein' },
  { re: /(ground\s+beef|minced\s+beef|boeuf\s+hache|carne\s+picada\s+de\s+res)/, zh: '牛肉末', kind: 'protein' },
  { re: /(beef\s+steak|steak\s+de\s+boeuf|biftecks?|bistec\s+de\s+res)/, zh: '牛排', kind: 'protein' },
  { re: /(\bboeuf\b|\bbeef\b|carne\s+de\s+res|\bres\b)/, zh: '牛肉', kind: 'protein', priority: 2 },

  { re: /(raw\s+peeled\s+jumbo\s+king\s+prawns?)/, zh: '生去壳特大对虾', kind: 'seafood' },
  { re: /(argentinian\s+red\s+shrimp|crevettes?\s+rouges?\s+d\s*argentine)/, zh: '阿根廷红虾', kind: 'seafood' },
  { re: /(shrimp\s+crackers?|prawn\s+crackers?)/, zh: '虾片', kind: 'snack' },
  { re: /(king\s+prawns?|gambas?)/, zh: '大虾', kind: 'seafood' },
  { re: /(prawns?|shrimps?|crevettes?)/, zh: '虾', kind: 'seafood' },
  { re: /(lobster|homard)/, zh: '龙虾', kind: 'seafood' },
  { re: /(crayfish\s+tails?|queues?\s+d\s*ecrevisses?)/, zh: '小龙虾尾', kind: 'seafood' },
  { re: /(trout\s+fillets?|filets?\s+de\s+truite)/, zh: '鳟鱼柳', kind: 'seafood' },
  { re: /(trout|truite)/, zh: '鳟鱼', kind: 'seafood' },
  { re: /(smoked\s+salmon|saumon\s+fume|salmon\s+ahumado)/, zh: '三文鱼', kind: 'seafood' },
  { re: /(salmon\s+fillets?|filet\s+de\s+saumon|lomo\s+de\s+salmon)/, zh: '三文鱼排', kind: 'seafood' },
  { re: /(salmon|saumon)/, zh: '三文鱼', kind: 'seafood' },
  { re: /(tuna\s+steak|steak\s+de\s+thon|atun\s+steak)/, zh: '金枪鱼排', kind: 'seafood' },
  { re: /(tuna|thon|atun)/, zh: '金枪鱼', kind: 'seafood' },
  { re: /(mackerel\s+fillets?|filets?\s+de\s+maquereaux)/, zh: '鲭鱼柳', kind: 'seafood' },
  { re: /(mackerel|maquereaux?)/, zh: '鲭鱼', kind: 'seafood' },
  { re: /(sardine\s+fillets?|filets?\s+de\s+sardines?|sardines?)/, zh: '沙丁鱼', kind: 'seafood' },
  { re: /(anchovies?|anchois)/, zh: '凤尾鱼', kind: 'seafood' },
  { re: /(cod\s+fillets?|filets?\s+de\s+morue|morue|cabillaud)/, zh: '鳕鱼', kind: 'seafood' },
  { re: /(colin\s+d\s*alaska|pollock)/, zh: '狭鳕', kind: 'seafood' },
  { re: /(sea\s+bass|\bbar\s+de\s+mer\b|\bbar\s+sauvage\b)/, zh: '海鲈鱼', kind: 'seafood' },
  { re: /(fish\s+sticks?)/, zh: '鱼条', kind: 'seafood' },
  { re: /(hareng|herring)/, zh: '鲱鱼', kind: 'seafood', priority: 3 },
  { re: /(fish|poisson)/, zh: '鱼肉', kind: 'seafood' },

  { re: /(greek\s+style\s+yogurt|greek\s+yogurt|yaourt\s+grec|yogourt\s+grec)/, zh: '希腊式酸奶', kind: 'dairy' },
  { re: /(yogurt|yoghurt|yaourt|yogourt)/, zh: '酸奶', kind: 'dairy', priority: 3 },
  { re: /(kefir|kefir|kéfir|кефир)/, zh: '开菲尔', kind: 'dairy', priority: 4 },
  { re: /(cream\s+cheese|fromage\s+frais)/, zh: '奶油奶酪', kind: 'dairy', priority: 5 },
  { re: /(cheddar)/, zh: '切达奶酪', kind: 'dairy' },
  { re: /(emmental)/, zh: '埃曼塔奶酪', kind: 'dairy' },
  { re: /(comte|comte\b|comte\s+aop|comte\s+bio|comte\s+au\s+lait)/, zh: '孔泰奶酪', kind: 'dairy' },
  { re: /(reblochon)/, zh: '瑞布罗申奶酪', kind: 'dairy' },
  { re: /(roquefort)/, zh: '罗克福奶酪', kind: 'dairy' },
  { re: /(mozzarella)/, zh: '马苏里拉奶酪', kind: 'dairy' },
  { re: /(parmesan)/, zh: '帕玛森奶酪', kind: 'dairy' },
  { re: /(feta)/, zh: '菲达奶酪', kind: 'dairy' },
  { re: /(mac\s*n\s*cheese|macaroni\s+and\s+cheese|macaroni\s+cheese|mac\s+cheese)/, zh: '芝士通心粉', kind: 'meal' },
  { re: /(cheese|fromage|queso)/, zh: '奶酪', kind: 'dairy', priority: 2 },
  { re: /(butter|beurre)/, zh: '黄油', kind: 'dairy', priority: 1 },
  { re: /(\bwhole\s+milk\b|\bskim\s+milk\b|\bmilk\b|\blait\b|\bleche\b)/, zh: '牛奶', kind: 'dairy', priority: 1 },

  { re: /(olive\s+oil|huile\s+d\s*olive)/, zh: '橄榄油', kind: 'condiment' },
  { re: /(vegetable\s+oil\s+spread|spread|tartare)/, zh: '涂抹酱', kind: 'condiment' },
  { re: /(mayonnaise)/, zh: '蛋黄酱', kind: 'condiment' },
  { re: /(mustard|mostaza|moutarde)/, zh: '芥末酱', kind: 'condiment', priority: 2 },
  { re: /(vinegar|vinaigre)/, zh: '醋', kind: 'condiment', priority: 2 },
  { re: /(hummus|humus|houmous)/, zh: '鹰嘴豆泥', kind: 'condiment', priority: 4 },
  { re: /(spice\s+paste.*butter\s+chicken|murgh\s+makhani)/, zh: '黄油鸡咖喱酱', kind: 'condiment' },
  { re: /(sriracha|chili\s+sauce|sauce\s+piquante)/, zh: '辣椒酱', kind: 'condiment', priority: 4 },
  { re: /(protein\s+shake|soy\s+protein\s+shake)/, zh: '蛋白奶昔', kind: 'drink' },
  { re: /(sauce)/, zh: '酱料', kind: 'condiment', priority: 1 },

  { re: /(hamburger\s+enriched\s+buns?|hamburger\s+buns?|burger\s+buns?)/, zh: '汉堡面包胚', kind: 'bakery' },
  { re: /(bagel)/, zh: '贝果', kind: 'bakery' },
  { re: /(pitta|pita|pittas?)/, zh: '皮塔饼', kind: 'bakery' },
  { re: /(baguette)/, zh: '法棍', kind: 'bakery' },
  { re: /(croissants?)/, zh: '可颂', kind: 'bakery' },
  { re: /(croutons?)/, zh: '面包丁', kind: 'bakery' },
  { re: /(petits?\s+pains?\s+grilles?|toasts?|biscotte)/, zh: '烤面包片', kind: 'bakery' },
  { re: /(pancakes?)/, zh: '松饼煎饼', kind: 'bakery' },
  { re: /(snackbread|\bbread\b|\bpain\b|\bpan\b)/, zh: '面包', kind: 'bakery' },
  { re: /(hello\s+panda)/, zh: '熊猫夹心饼干', kind: 'snack' },
  { re: /(milk\s+duds)/, zh: '牛奶巧克力糖', kind: 'snack' },
  { re: /(crackers?|craquelins?)/, zh: '薄脆饼干', kind: 'snack', priority: 2 },
  { re: /(muffins?|danoises?)/, zh: '松饼', kind: 'bakery', priority: 2 },
  { re: /(biscuits?|cookies?|galletas?)/, zh: '饼干', kind: 'snack', priority: 2 },
  { re: /(corn\s+flakes|cereal|cereales?|flakes)/, zh: '谷物片', kind: 'snack' },
  { re: /(creme\s+brulee|creme\s+brulee|cr[eè]me\s+brul[eé]e)/, zh: '焦糖布蕾', kind: 'snack' },
  { re: /(chocolate|chocolat)/, zh: '巧克力', kind: 'snack' },
  { re: /(chips|crisps|lays)/, zh: '薯片', kind: 'snack' },

  { re: /(bagel.*saumon.*fromage\s+frais|bagel.*smoked\s+salmon.*cream\s+cheese)/, zh: '三文鱼奶油奶酪贝果', kind: 'meal' },
  { re: /(poulet\s+tikka\s+masala\s+et\s+riz\s+pilaf|chicken\s+tikka\s+masala\s+and\s+pilaf\s+rice)/, zh: '鸡肉提卡玛萨拉配抓饭', kind: 'meal' },
  { re: /(poulet\s+tikka\s+masala|chicken\s+tikka\s+masala|tikka\s+masala)/, zh: '提卡玛萨拉', kind: 'meal' },
  { re: /(pizza)/, zh: '披萨', kind: 'meal' },
  { re: /(salad|salade|ensalada)/, zh: '沙拉', kind: 'meal', priority: 2 },
  { re: /(soup|soupe|bisque|potage)/, zh: '汤', kind: 'meal', priority: 2 },
  { re: /(ramen)/, zh: '拉面', kind: 'meal' },
  { re: /(laksa)/, zh: '叻沙', kind: 'meal' },
  { re: /(chow\s+mein)/, zh: '炒面', kind: 'meal' },
  { re: /(nems?)/, zh: '春卷', kind: 'meal' },
  { re: /(burger|hamburger)/, zh: '汉堡', kind: 'meal', priority: 2 },
  { re: /(wrap)/, zh: '卷饼', kind: 'meal', priority: 2 },

  { re: /(jus\s+de\s+roti)/, zh: '烤肉汁', kind: 'condiment' },
  { re: /(aloe\s+vera)/, zh: '芦荟饮料', kind: 'drink' },
  { re: /(juice|jus|jugo)/, zh: '果汁', kind: 'drink', priority: 1 },
  { re: /(lemonade)/, zh: '汽水', kind: 'drink' },

  { re: /(brown\s+rice|riz\s+complet)/, zh: '糙米', kind: 'produce' },
  { re: /(crushed\s+tomatoes?|diced\s+tomatoes?)/, zh: '番茄碎', kind: 'produce' },
  { re: /(cauliflower)/, zh: '花椰菜', kind: 'produce' },
  { re: /(courgettes?|zucchini)/, zh: '西葫芦', kind: 'produce' },
  { re: /(cherry\s+tomatoes?|tomates?\s+cerises?)/, zh: '樱桃番茄', kind: 'produce' },
  { re: /(tomatoes?|tomates?)/, zh: '番茄', kind: 'produce' },
  { re: /(avocados?)/, zh: '牛油果', kind: 'produce' },
  { re: /(brocolis?|broccoli)/, zh: '西兰花', kind: 'produce' },
  { re: /(spinach|epinards?)/, zh: '菠菜', kind: 'produce' },
  { re: /(peas?|petit\s+pois)/, zh: '豌豆', kind: 'produce' },
  { re: /(green\s+beans?|haricots?\s+verts?)/, zh: '四季豆', kind: 'produce' },
  { re: /(carrots?|carottes?)/, zh: '胡萝卜', kind: 'produce' },
  { re: /(beetroot|betteraves?)/, zh: '甜菜', kind: 'produce' },
  { re: /(eggplants?|aubergines?)/, zh: '茄子', kind: 'produce' },
  { re: /(radish|radis)/, zh: '萝卜', kind: 'produce' },
  { re: /(apples?|pommes?)/, zh: '苹果', kind: 'produce', priority: 1 },
  { re: /(dates?|dattes?)/, zh: '椰枣', kind: 'produce' },
  { re: /(figues?|figs?)/, zh: '无花果', kind: 'produce' },
  { re: /(raspberries?|framboises?)/, zh: '覆盆子', kind: 'produce' },
  { re: /(mango(es)?|mangues?)/, zh: '芒果', kind: 'produce' },
  { re: /(limes?)/, zh: '青柠', kind: 'produce' },
  { re: /(fruit\s+mix|melange\s+de\s+fruits?\s+tropicaux|mixed\s+fruits?)/, zh: '水果混合', kind: 'produce' },
  { re: /(fruits?\s+secs?|dried\s+mangoes?)/, zh: '果干', kind: 'produce' },
];

const PREFIX_RULES = [
  { re: /\bready\s*to\s*eat\b|pret\s+a\s+consommer/, zh: '即食', bucket: 'style' },
  { re: /\bpre\s*cooked\b|precuit|prefrit|pre\s*fried/, zh: '预制', bucket: 'state' },
  { re: /\braw\b|\bcru\b|crues|cruda|crudo|a\s+cuire/, zh: '生', bucket: 'state' },
  { re: /\bfully\s+cooked\b|\bcooked\b|\bcuit\b|cuite|cuites|cocido|cocida/, zh: '熟制', bucket: 'state' },
  { re: /\bgrilled\b|grille|grillee|grillées|grillé|grillees|a\s+la\s+plancha|plancha/, zh: '烤', bucket: 'process' },
  { re: /\broast(?:ed)?\b|roti|roti\b|roti\s+de|rôti|dor[eé]\s+au\s+four|oven\s+roasted|asado|au\s+feu\s+de\s+bois/, zh: '烤', bucket: 'process' },
  { re: /\bsmoked\b|fume|fumee|fumé|fumee|ahumado|ahumada/, zh: '烟熏', bucket: 'process' },
  { re: /\bmarinated\b|marine|marinee|mariné|marinade|adobado|marinado/, zh: '腌制', bucket: 'process' },
  { re: /\bsteamed\b|vapeur/, zh: '蒸熟', bucket: 'process' },
  { re: /\bbraised\b|braise|braisee|braisé|estofado/, zh: '炖煮', bucket: 'process' },
  { re: /\bfried\b|frit|frite|frito|frita/, zh: '油炸', bucket: 'process' },
  { re: /breaded|panko|tempura|rebozado|pane/, zh: '裹粉', bucket: 'process' },
  { re: /frozen|surgel|congelad/, zh: '冷冻', bucket: 'state' },
  { re: /skinless|sans\s+peau|sin\s+piel/, zh: '去皮', bucket: 'cut' },
  { re: /boneless|sans\s+os|sin\s+hueso/, zh: '去骨', bucket: 'cut' },
  { re: /peeled|decortiqu|pelad/, zh: '去壳', bucket: 'cut' },
  { re: /shell\s*on|avec\s+carapace|con\s+cascara/, zh: '带壳', bucket: 'cut' },
  { re: /avec\s+couenne/, zh: '带皮', bucket: 'cut' },
  { re: /jumbo|xxl|extra\s+large/, zh: '特大', bucket: 'size' },
  { re: /\bking\b/, zh: '大', bucket: 'size' },
  { re: /mini/, zh: '迷你', bucket: 'size' },
  { re: /plain|nature|natural|l\s+originale?|original/, zh: '原味', bucket: 'flavor' },
  { re: /spicy|epice|epicee|epicees|picante|hot\s+and\s+spicy/, zh: '香辣', bucket: 'flavor' },
  { re: /organic|\bbio\b|biologique|organico|orgánico|ecologico|ecologiques/, zh: '有机', bucket: 'style' },
  { re: /halal/, zh: '清真', bucket: 'style' },
  { re: /cajun/, zh: '卡真风味', bucket: 'flavor' },
  { re: /barbecue|bbq/, zh: '烧烤风味', bucket: 'flavor' },
  { re: /aux\s+herbes|fines?\s+herbes|herbes?|herb/, zh: '香草风味', bucket: 'flavor' },
  { re: /proven[cs]al/, zh: '普罗旺斯风味', bucket: 'flavor' },
  { re: /extra\s+tendre|tender/, zh: '嫩', bucket: 'style' },
  { re: /wild|sauvage/, zh: '野生', bucket: 'style' },
  { re: /british/, zh: '英国产', bucket: 'origin' },
  { re: /argentinian|argentine/, zh: '阿根廷', bucket: 'origin' },
  { re: /quebec/, zh: '魁北克', bucket: 'origin' },
  { re: /greek\s+style|greek/, zh: '希腊式', bucket: 'style' },
  { re: /stone\s+ground/, zh: '石磨', bucket: 'style' },
  { re: /whole\s+grain|multigrain|multi\s*cereales?|ble\s+complet|wheat\s+bread/, zh: '全谷物', bucket: 'style' },
  { re: /nonfat|fat\s*free|0\s*mg|0\s*%|skim/, zh: '脱脂', bucket: 'nutrition' },
  { re: /semi\s*skim|demi\s*ecreme|semi\s*skimmed/, zh: '低脂', bucket: 'nutrition' },
  { re: /whole\s+milk|lait\s+entier|entier/, zh: '全脂', bucket: 'nutrition' },
  { re: /sweetened/, zh: '加糖', bucket: 'nutrition' },
  { re: /unsweetened|sans\s+sucre/, zh: '无糖', bucket: 'nutrition' },
  { re: /vitamin\s*d/, zh: '维生素D强化', bucket: 'nutrition' },
  { re: /calcium/, zh: '高钙', bucket: 'nutrition' },
  { re: /pasteurized|pasteurise/, zh: '巴氏杀菌', bucket: 'style' },
  { re: /fresh|frais|fraiche/, zh: '新鲜', bucket: 'style' },
  { re: /dried|secs?\b|secas?\b/, zh: '干制', bucket: 'state' },
  { re: /sans\s+sel|unsalted/, zh: '无盐', bucket: 'nutrition' },
  { re: /sale|salees?|salado|salted/, zh: '盐渍', bucket: 'nutrition' },
  { re: /pulp\s+free|sans\s+pulpe/, zh: '无果肉', bucket: 'style' },
  { re: /morceaux\s+de\s+fruits?|avec\s+morceaux|with\s+pieces?/, zh: '果粒', bucket: 'style' },
  { re: /sans\s+morceaux|without\s+pieces?/, zh: '无果粒', bucket: 'style' },
];

const SUFFIX_RULES = [
  { re: /\bsliced\b|\bslice\b|tranches?|thinly\s+sliced|fines?|epaisses?|épaisses?/, zh: '切片' },
  { re: /\bstrips?\b|lamelles?/, zh: '条' },
  { re: /\bdiced\b|cubes?|morceaux|trozos/, zh: '块' },
  { re: /tails?/, zh: '尾' },
];

const FLAVOR_RULES = [
  { re: /vanilla|vanille/, zh: '香草味' },
  { re: /caramel/, zh: '焦糖味' },
  { re: /frambois|raspberry/, zh: '覆盆子味' },
  { re: /strawberry|fraise/, zh: '草莓味' },
  { re: /blueberry|myrtille/, zh: '蓝莓味' },
  { re: /red\s+berries|fruits?\s+rouges?/, zh: '红莓味' },
  { re: /mango|mangue/, zh: '芒果味' },
  { re: /passion/, zh: '百香果味' },
  { re: /speculoos/, zh: '焦糖饼干风味' },
  { re: /papaya/, zh: '木瓜味' },
  { re: /coriander|coriandre/, zh: '香菜风味' },
  { re: /peanut\s+butter|beurre\s+d\s*arachide/, zh: '花生酱味' },
  { re: /\bgarlic\b|\bail\b/, zh: '蒜香' },
  { re: /ginger|gingembre/, zh: '姜味' },
  { re: /teriyaki/, zh: '照烧' },
  { re: /sesame|sesamo|sésame/, zh: '芝麻风味' },
  { re: /lemon|citron/, zh: '柠檬味' },
  { re: /honey/, zh: '蜂蜜味' },
  { re: /\bapple\b/, zh: '苹果味' },
  { re: /cinnamon|cannelle/, zh: '肉桂味' },
  { re: /pesto/, zh: '青酱风味' },
  { re: /smoke(d)?\s+flavo[u]?r|gout\s+fume/, zh: '烟熏风味' },
  { re: /double\s+choc|double\s+chocolate|\bchoco\b|schoko|cacao|cocoa/, zh: '巧克力味' },
  { re: /hazelnut|noisettes?/, zh: '榛子味' },
  { re: /mushrooms?|champignons?/, zh: '蘑菇风味' },
  { re: /romarin|rosemary/, zh: '迷迭香风味' },
  { re: /basilic|basil/, zh: '罗勒风味' },
  { re: /apricot|abricot/, zh: '杏味' },
  { re: /banana|banane/, zh: '香蕉味' },
  { re: /piment|chili/, zh: '辣椒风味' },
];

function detectNoun(raw, baseZh) {
  let best = null;
  for (const rule of NOUN_RULES) {
    const match = raw.match(rule.re);
    if (!match) continue;
    const score = (rule.priority || 0) * 1000 + String(match[0] || '').length;
    if (!best || score > best.score) best = { zh: rule.zh, kind: rule.kind, score };
  }
  if (best) return { zh: best.zh, kind: best.kind };
  return { zh: cleanupZh(baseZh || ''), kind: 'generic' };
}

function detectParts(raw, nounInfo) {
  const buckets = {
    origin: [],
    style: [],
    nutrition: [],
    state: [],
    process: [],
    cut: [],
    size: [],
    flavor: [],
  };
  for (const rule of PREFIX_RULES) {
    if (rule.re.test(raw)) uniq(buckets[rule.bucket] || buckets.style, rule.zh);
  }
  if (/fromage\s+frais/.test(raw)) {
    buckets.style = buckets.style.filter((tag) => tag !== '新鲜');
  }
  for (const rule of FLAVOR_RULES) if (rule.re.test(raw)) uniq(buckets.flavor, rule.zh);
  const suffix = [];
  for (const rule of SUFFIX_RULES) if (rule.re.test(raw)) uniq(suffix, rule.zh);

  if (nounInfo.kind === 'dairy' && /morceaux\s+de\s+fruits?|avec\s+morceaux|with\s+pieces?/.test(raw)) uniq(buckets.style, '果粒');
  if (nounInfo.kind === 'drink' && /100\s*%/.test(raw)) uniq(buckets.style, '100%');
  if (nounInfo.kind === 'meal' && /protein[eé]|proteine|high\s+protein/.test(raw)) uniq(buckets.nutrition, '高蛋白');
  return { buckets, suffix };
}

function normalizeNounZh(noun) {
  return cleanupZh(noun || '')
    .replace(/^白鸡肉$/, '鸡胸肉')
    .replace(/^白烟熏鸡肉$/, '烟熏鸡胸肉')
    .replace(/^鱼片鸡肉$/, '鸡胸肉')
    .replace(/^英国鸡肉$/, '英国产鸡胸肉')
    .replace(/^英国迷你鸡肉$/, '英国产迷你鸡胸肉')
    .replace(/^碎鸡肉$/, '鸡肉碎')
    .replace(/^鱼片原味$/, '原味鱼片')
    .replace(/^豆腐原味$/, '原味豆腐')
    .replace(/^菠菜有机$/, '有机菠菜')
    .replace(/^有机豆豆$/, '有机四季豆')
    .replace(/^整只有机蔬菜$/, '整颗有机蔬菜')
    .replace(/^牛奶生黄油$/, '生乳黄油')
    .replace(/^牛奶$/, '牛奶')
    .replace(/^酸奶$/, '酸奶');
}

function needsOverride(baseZh, nounInfo, parts, raw) {
  const clean = cleanupZh(baseZh || '');
  if (!clean) return true;
  if (BAD_ZH_PATTERNS.some((re) => re.test(clean))) return true;
  if (/\d{4,}/.test(clean)) return true;
  if (/^[A-Za-z0-9\s%]+$/.test(clean)) return true;
  if (nounInfo.zh && clean !== nounInfo.zh && BAD_ZH_PATTERNS.some((re) => re.test(nounInfo.zh))) return true;
  if (parts.buckets.state.length && !parts.buckets.state.some((tag) => clean.includes(tag.replace('熟制', '熟')) || clean.includes(tag))) return true;
  if (parts.buckets.process.length && !parts.buckets.process.some((tag) => clean.includes(tag))) return true;
  if (parts.buckets.cut.length && !parts.buckets.cut.some((tag) => clean.includes(tag))) return true;
  if (parts.buckets.size.length && !parts.buckets.size.some((tag) => clean.includes(tag))) return true;
  if (parts.buckets.flavor.length && !parts.buckets.flavor.some((tag) => clean.includes(tag.replace(/风味$/, '')) || clean.includes(tag))) return true;
  if (parts.suffix.length && !parts.suffix.some((tag) => clean.includes(tag))) return true;
  if (nounInfo.kind !== 'generic' && nounInfo.zh && !clean.includes(nounInfo.zh.replace(/肉$/, '')) && !clean.includes(nounInfo.zh)) return true;
  if (/\b(raw|cooked|grilled|roast|smoked|marinated|sliced|skinless|boneless|peeled|frozen|organic|greek|nonfat|whole milk)\b/.test(raw) && /^(鸡肉|鸡胸肉|虾|鱼肉|三文鱼|酸奶|牛奶|火腿|猪肉|牛肉|奶酪|面包)$/.test(clean)) return true;
  return false;
}

function bucketOrder(kind) {
  if (kind === 'dairy') return ['style', 'nutrition', 'state', 'process', 'cut', 'size', 'flavor'];
  if (kind === 'drink') return ['style', 'nutrition', 'state', 'flavor'];
  if (kind === 'dessert') return ['style', 'nutrition', 'state', 'process', 'flavor'];
  return ['origin', 'style', 'nutrition', 'state', 'process', 'cut', 'size', 'flavor'];
}

function composeZh(nounInfo, parts) {
  const noun = normalizeNounZh(nounInfo.zh);
  const order = bucketOrder(nounInfo.kind);
  const prefix = [];
  for (const key of order) {
    for (const tag of parts.buckets[key] || []) uniq(prefix, tag);
  }
  const suffix = [];
  for (const tag of parts.suffix || []) uniq(suffix, tag);

  let title = '';
  if (/酸奶|牛奶|奶酪|黄油|开菲尔|果汁|汽水|芦荟饮料|橄榄油|蛋黄酱|鹰嘴豆泥|涂抹酱|酱料/.test(noun)) {
    title = `${prefix.join('')}${noun}`;
  } else if (/条$|丝$|块$|片$|丁$|尾$/.test(noun)) {
    title = `${prefix.join('')}${noun}`;
  } else {
    title = `${prefix.join('')}${noun}${suffix.join('')}`;
  }

  title = title
    .replace(/熟制熟制/g, '熟制')
    .replace(/烟熏烟熏/g, '烟熏')
    .replace(/切片切片/g, '切片')
    .replace(/果粒果粒/g, '果粒')
    .replace(/希腊式希腊式/g, '希腊式')
    .replace(/蒜香蒜香/g, '蒜香')
    .replace(/原味原味/g, '原味')
    .replace(/全脂脱脂/g, '脱脂')
    .replace(/低脂脱脂/g, '脱脂')
    .replace(/有机有机/g, '有机')
    .replace(/迷你特大/g, '特大')
    .replace(/冷冻生/g, '冷冻生')
    .replace(/预制熟制/g, '预制熟制')
    .replace(/蒸熟熟制/g, '蒸熟')
    .replace(/原味香辣/g, '香辣')
    .replace(/盐渍无盐/g, '无盐')
    .replace(/无果粒果粒/g, '无果粒')
    .replace(/100%果汁/g, '100%果汁')
    .replace(/100%芦荟饮料/g, '100%芦荟饮料')
    .replace(/三明治三明治/g, '三明治')
    .replace(/卷饼卷饼/g, '卷饼')
    .replace(/烤肉烤肉/g, '烤肉')
    .replace(/冰淇淋冰淇淋/g, '冰淇淋')
    .replace(/提拉米苏提拉米苏/g, '提拉米苏')
    .replace(/意式奶冻意式奶冻/g, '意式奶冻')
    .replace(/芝士蛋糕芝士蛋糕/g, '芝士蛋糕')
    .replace(/巧克力味巧克力/g, '巧克力')
    .replace(/焦糖味焦糖/g, '焦糖')
    .replace(/香草味香草/g, '香草')
    .replace(/阿根廷英国产/g, '阿根廷')
    .replace(/英国产阿根廷/g, '阿根廷');
  return cleanupZh(title);
}

function enhanceBaseZh(baseZh, nounInfo, parts) {
  const clean = cleanupZh(baseZh || '');
  if (!clean) return composeZh(nounInfo, parts);
  let title = clean;
  const order = bucketOrder(nounInfo.kind);
  for (const key of order) {
    for (const tag of parts.buckets[key] || []) {
      const alt = tag === '熟制' ? '熟' : tag.replace(/风味$/, '');
      if (!title.includes(tag) && !title.includes(alt)) title = `${tag}${title}`;
    }
  }
  for (const tag of parts.suffix || []) {
    if (!title.includes(tag)) title = `${title}${tag}`;
  }
  title = title
    .replace(/熟制烟熏熟制/g, '熟制烟熏')
    .replace(/希腊式希腊式/g, '希腊式')
    .replace(/蒜香蒜香/g, '蒜香')
    .replace(/原味原味/g, '原味')
    .replace(/三明治三明治/g, '三明治')
    .replace(/卷饼卷饼/g, '卷饼')
    .replace(/有机有机/g, '有机');
  return cleanupZh(title);
}


function applyContextZhCorrections(food, zh, raw) {
  let title = cleanupZh(zh || '');
  if (!title) return title;
  const has = (re) => re.test(raw);

  if (has(/veggie\s+colin\s+the\s+caterpillar/)) title = '素食毛毛虫蛋糕';
  else if (has(/colin\s+the\s+caterpillar|caterpillar\s+cake/)) title = '毛毛虫蛋糕';

  if (has(/pate\s+a\s+chaussons?/)) title = '酥皮面团';
  if (has(/pate\s+au\s+poulet|chicken\s+pie/)) title = '鸡肉派';
  if (has(/pate\s+lorrain/)) title = '洛林肉派';
  if (has(/pate\s+de\s+foie|foie\s+pate/)) title = '肝酱';
  if (has(/pate\s+de\s+piment/)) title = '辣椒酱';

  if (has(/mousse.*fromage\s+frais|fromage\s+frais.*mousse/)) title = '奶油奶酪慕斯';
  if (has(/flan.*fromage\s+frais|fromage\s+frais.*flan/)) title = '奶油奶酪布丁';
  if (has(/wrap.*caesar.*poulet|wrap.*poulet.*caesar|caesar.*wrap.*chicken|chicken.*caesar.*wrap/)) title = /roti|roasted|oven roasted/.test(raw) ? '烤鸡凯撒卷饼' : '鸡肉凯撒卷饼';
  if (has(/club.*caesar.*poulet|club.*poulet.*caesar|caesar.*club.*chicken|chicken.*caesar.*club/)) title = /roti|roasted|oven roasted/.test(raw) ? '烤鸡凯撒三明治' : '鸡肉凯撒三明治';
  if (has(/salade.*caesar.*poulet|salad.*caesar.*chicken|poulet.*caesar.*salad|chicken.*caesar.*salad/)) title = /roti|roasted|oven roasted/.test(raw) ? '烤鸡凯撒沙拉' : '鸡肉凯撒沙拉';
  if (has(/caesar\s+dressing|sauce\s+caesar|caesar\s+sauce/) && !/(wrap|club|poulet|chicken|salad|salade)/.test(raw)) title = '凯撒沙拉酱';
  if (has(/salad\s+cream/)) title = '沙拉酱';
  if (has(/boisson\s+au\s+soja.*calcium|soy\s+drink.*calcium|soy\s+milk.*calcium|calcium.*soy\s+drink/)) title = '高钙豆奶饮料';
  else if (has(/boisson\s+au\s+soja|soy\s+drink|soy\s+milk|lait\s+de\s+soja/)) title = title.replace(/^高钙/, '');
  if (has(/boisson\s+au\s+soja|soy\s+drink|soy\s+milk|lait\s+de\s+soja/) && !/豆奶饮料/.test(title)) {
    title = (/calcium/.test(raw) ? '高钙' : '') + '豆奶饮料';
  }
  if (has(/peanut\s+butter|beurre\s+d\s*arachide/)) title = '花生酱';
  if (has(/creme\s+de\s+marrons?/)) title = '栗子酱';
  if (has(/puree\s+de\s+marrons?/)) title = '栗子泥';
  if (has(/marrons?\s+glaces?|marron\s+glace/)) title = '糖渍栗子';
  if (has(/oven\s+roasted.*garlic.*onion.*pasta\s+sauce|pasta\s+sauce.*roast.*garlic.*onion/)) title = '烤蒜洋葱意面酱';
  else if (has(/tomato.*onion.*roast.*garlic.*pasta\s+sauce/)) title = '番茄洋葱烤蒜意面酱';
  else if (has(/spaghetti\s+sauce|pasta\s+sauce/) && /mushroom|champignon/.test(raw)) title = '蘑菇意面酱';
  else if (has(/spaghetti\s+sauce|pasta\s+sauce/)) title = '意面酱';
  if (has(/tomato\s+paste/)) title = '番茄膏';
  if (has(/tomato\s+puree|puree\s+de\s+tomates?/)) title = '番茄泥';
  if (has(/english\s+muffin.*cheese|cheese.*english\s+muffin|fromage.*muffin\s+anglais/)) title = '奶酪英式松饼';
  if (has(/cottage\s+cheese/)) title = '茅屋奶酪';
  if (has(/whole\s+milk\s+cheese/)) title = '全脂奶酪';
  if (has(/goat\s+milk\s+cheese/)) title = '山羊奶酪';
  if (has(/soft\s+cheese/)) title = '软质奶酪';
  if (has(/cheese\s+crackers?|crackers?.*cheese/)) title = '奶酪味薄脆饼干';
  if (has(/crackers?\s+a\s+la\s+betterave|beetroot\s+crackers?/)) title = '甜菜薄脆饼干';
  if (has(/crackers?.*courgette|courgette.*crackers?/)) title = '西葫芦风味薄脆饼干';
  if (has(/crackers?\s+gout\s+quiche/)) title = '咸派风味薄脆饼干';
  if (has(/salade\s+chicken\s+caesar|chicken\s+caesar\s+salad|salad.*caesar.*chicken|caesar.*chicken.*salad|poulet\s+caesar/) && !/(wrap|club)/.test(raw)) title = /roti|roasted|oven roasted/.test(raw) ? '烤鸡凯撒沙拉' : '鸡肉凯撒沙拉';

  if (has(/cocktail\s+de\s+fruits\s+de\s+mer|seafood\s+cocktail/)) title = /frozen|surgel|congelad/.test(raw) ? '冷冻海鲜拼盘' : '海鲜拼盘';
  if (has(/filets?\s+de\s+hareng\s+fumes?|smoked\s+herring\s+fillets?/)) title = /marin/.test(raw) ? '烟熏腌制鲱鱼柳' : '烟熏鲱鱼柳';
  if (has(/roti\s+de\s+boeuf|roast\s+beef/)) title = /cuit/.test(raw) ? '熟制烤牛肉' : '烤牛肉';
  if (has(/jus\s+de\s+roti/)) title = '烤肉汁';
  if (has(/ananas\s+en\s+morceaux|pineapple\s+chunks?/)) title = '菠萝块';
  if (has(/tranches?\s+d\s*ananas|pineapple\s+slices?/)) title = '菠萝片';
  if (has(/poires?\s+demi\s+fruits?|pear\s+halves?/)) title = '梨半颗';
  if (has(/peches?\s+demi\s+fruits?|peaches?\s+halves?/)) title = '桃半颗';
  if (has(/cocktail\s+de\s+fruits(?!\s+de\s+mer)|fruit\s+cocktail/)) title = '什锦水果';
  if (has(/melange\s+de\s+fruits?\s+tropicaux|mixed\s+tropical\s+fruits?/)) title = '热带水果混合';

  if (has(/light\s+syrup|sirop\s+leger/) && /(梨半颗|桃半颗|什锦水果)/.test(title) && !/轻糖浆/.test(title)) title = `轻糖浆${title}`;
  if (has(/in\s+juice|au\s+jus/) && /(菠萝片|菠萝块|梨半颗|桃半颗|什锦水果)/.test(title) && !/果汁浸泡/.test(title)) title = `${title}果汁浸泡`;
  if (/(organic|bio|biologique|organico|orgánico)/.test(raw) && !/^有机/.test(title) && /(花生酱|意面酱|番茄泥|豆奶饮料|菠萝块|菠萝片|热带水果混合|奶酪|苹果酥皮派|梨酥皮派|金枪鱼酥皮派|栗子泥|栗子酱)/.test(title)) title = `有机${title}`;

  return cleanupZh(title);
}


function categoryContextText(food) {
  return normalizeRaw([food?.g || '', food?.u || '', food?.b || ''].filter(Boolean).join(' '));
}

function firstMatchLabel(raw, pairs) {
  for (const [re, label] of pairs) {
    if (re.test(raw)) return label;
  }
  return '';
}

function refineZhWithCategory(food, zh, raw) {
  let title = cleanupZh(zh || '');
  if (!title) return title;
  const category = categoryContextText(food);
  const hasCat = (re) => re.test(category);
  const hasRaw = (re) => re.test(raw);
  const isOrganic = /(organic|bio|biologique|organico|orgánico)/.test(raw);
  const fruitZh = firstMatchLabel(raw, [
    [/lychee|litchi/, '荔枝'],
    [/orange\s+sanguine|blood\s+orange/, '血橙'],
    [/orange/, '橙'],
    [/apple|pomme/, '苹果'],
    [/grape|raisin|uva/, '葡萄'],
    [/peach|peche/, '桃'],
    [/cherry|cerise/, '樱桃'],
    [/lime|citron\s+vert/, '青柠'],
    [/prune|pruneau/, '西梅'],
    [/clementine|cl[ée]mentine/, '克莱门氏小橘'],
    [/berry|baies|fruits\s+rouges/, '莓果'],
    [/acai/, '巴西莓'],
    [/pineapple|ananas/, '菠萝'],
    [/tomato|tomate/, '番茄'],
    [/guava|goyave/, '番石榴'],
  ]);
  const cheeseZh = firstMatchLabel(raw, [
    [/cheddar/, '切达奶酪'],
    [/mozzarella/, '马苏里拉奶酪'],
    [/swiss/, '瑞士奶酪'],
    [/emmental/, '埃曼塔奶酪'],
    [/parmesan|parmigiano/, '帕玛森奶酪'],
    [/provolone/, '普罗卧干酪'],
    [/queso\s+fresco/, '新鲜奶酪'],
    [/goat'?s\s+cheese|chevre/, '山羊奶酪'],
  ]);
  const breadZh = firstMatchLabel(raw, [
    [/pain\s+au\s+levain|sourdough/, '酸种面包'],
    [/pain\s+complet|whole\s*meal|wholegrain|whole\s+grain/, '全麦面包'],
    [/pain\s+de\s+campagne|campagne|farmhouse/, '乡村面包'],
    [/naan/, '印度烤饼'],
    [/pain\s+de\s+mie|toast|soft\s+white/, '吐司面包'],
    [/french\s+bread|baguette/, '法式面包'],
    [/gluten\s*free|sans\s+gluten/, '无麸质面包'],
    [/multigrain|12\s+grains?|7\s+grain/, '多谷物面包'],
  ]);

  if (hasRaw(/\bpeter\s+pan\s+creamy\b/) && hasCat(/peanut\s+butters?/)) {
    title = '顺滑花生酱';
  }

  if (hasRaw(/\bgoldfish\b/) && hasCat(/crackers?|biscuits?|snacks?/)) {
    title = '金鱼形饼干';
  }
  if (hasRaw(/swedish\s+fish/) && hasCat(/cand|bonbon|sweet|gummy|snacks?/)) {
    title = '瑞典鱼软糖';
  }
  if (hasRaw(/milk\s+duds/) && hasCat(/cand|chocolate|sweet/)) {
    title = '牛奶焦糖巧克力';
  }

  if ((/^牛奶$/.test(title) || /^原味牛奶$/.test(title) || /^有机牛奶$/.test(title))) {
    if (hasRaw(/milk\s+chocolate|chocolat\s+au\s+lait/)) title = `${isOrganic ? '有机' : ''}牛奶巧克力`;
    else if (hasRaw(/chocolate\s+milk|lait\s+chocolate/)) title = `${isOrganic ? '有机' : ''}${/(1%|low\s*fat|reduced\s*fat|2%)/.test(raw) ? '低脂' : ''}巧克力牛奶`;
    else if (hasRaw(/condensed\s+milk|lait\s+concentre/)) title = `${isOrganic ? '有机' : ''}炼乳`;
    else if (hasRaw(/almond\s+milk|lait\s+d\s*amande/)) title = `${isOrganic ? '有机' : ''}杏仁奶`;
    else if (hasRaw(/oat\s+milk|lait\s+d\s*avoine/)) title = `${isOrganic ? '有机' : ''}燕麦奶`;
    else if (hasRaw(/coconut\s+milk|lait\s+de\s+coco/)) title = `${isOrganic ? '有机' : ''}椰奶`;
    else if (hasRaw(/pain\s+au\s+lait|milk\s+bread/)) title = `${isOrganic ? '有机' : ''}牛奶面包`;
    else if (/whole\s+milk|lait\s+entier|entier/.test(raw)) title = `${isOrganic ? '有机' : ''}全脂牛奶`;
    else if (/(2%|reduced\s*fat|low\s*fat|1%|skim)/.test(raw)) title = `${isOrganic ? '有机' : ''}低脂牛奶`;
    else if (hasCat(/chocolate|cand|sweet/)) title = `${isOrganic ? '有机' : ''}牛奶巧克力`;
    else if (hasCat(/bread|bakery|baked\s+goods/)) title = `${isOrganic ? '有机' : ''}牛奶面包`;
    else if (hasCat(/beverages?|drinks?|milks?/)) title = `${isOrganic ? '有机' : ''}牛奶`;
  }

  if (/^(奶酪|全脂奶酪|有机奶酪)$/.test(title)) {
    if (hasRaw(/monterey\s+jack/)) title = `${isOrganic ? '有机' : ''}蒙特利杰克${/whole\s+milk|lait\s+entier|entier/.test(raw) ? '全脂' : ''}奶酪`;
    else if (hasRaw(/fromage\s+blanc/)) title = /whole\s+milk|lait\s+entier|entier/.test(raw) ? '全脂法式白奶酪' : '法式白奶酪';
    else if (hasRaw(/cream\s+cheese|fromage\s+frais/) && !/慕斯|布丁/.test(title)) title = '奶油奶酪';
    else if (hasCat(/sauces?|condiments?/) && hasRaw(/cheese|fromage/)) title = '奶酪酱';
    else if (hasCat(/pizzas?/)) title = '奶酪披萨';
    else if (hasCat(/burgers?/)) title = '芝士汉堡';
    else if (hasCat(/sandwich/)) title = '奶酪三明治';
    else if (hasCat(/crackers?|biscuits?/)) title = '奶酪味薄脆饼干';
    else if (hasCat(/ravioli|pastas?|prepared\s+pastas?|macaroni/)) title = '奶酪意面';
    else if (hasCat(/fresh\s+cheeses?|fromages?\s+frais/) && hasRaw(/fromage\s+blanc/)) title = '法式白奶酪';
  }

  if (/^(水果|有机水果|原味水果)$/.test(title)) {
    if (hasRaw(/fruit\s+cake|cake\s+aux\s+fruits?/)) title = '水果蛋糕';
    else if (hasRaw(/fruit\s+snacks?/) || hasCat(/fruit\s+snacks?|candies|gummies|chewy\s+candies/)) title = '果味软糖';
    else if (hasCat(/breakfast\s+cereals?|cereals?/)) title = '水果谷物片';
    else if (hasCat(/yogurts?/)) title = '水果酸奶';
    else if (hasCat(/juices?|drinks?/)) title = fruitZh ? `${fruitZh}汁` : '多种水果果汁';
    else if (hasCat(/nuts?|mixes?|trail\s+mix/)) title = '水果坚果混合';
  }

  if (/^原味$/.test(title)) {
    if (hasCat(/chips|crisps/)) title = '原味薯片';
    else if (hasCat(/yogurts?/)) title = '原味酸奶';
    else if (hasCat(/bread|bakery|baked\s+goods/)) title = '原味面包';
    else if (hasCat(/breakfast\s+cereals?|cereals?/)) title = '原味谷物片';
    else if (hasCat(/falafels?/)) title = '原味法拉费';
    else if (hasCat(/crackers?|biscuits?/)) title = '原味饼干';
  }

  if (/^有机$/.test(title)) {
    if (hasRaw(/passata/)) title = '有机番茄泥';
    else if (hasRaw(/emmental/)) title = '有机埃曼塔奶酪';
    else if (hasRaw(/fusilli/)) title = '有机螺旋意面';
    else if (hasRaw(/conchiglioni/)) title = '有机大贝壳面';
    else if (hasRaw(/miso/)) title = '有机味噌';
    else if (hasRaw(/agave/)) title = '有机蓝龙舌兰糖浆';
    else if (hasRaw(/darjeeling/)) title = '有机大吉岭红茶';
    else if (hasRaw(/kaisergemuse|kaisergemüse|gemuse|gemüse/)) title = '有机混合蔬菜';
    else if (hasRaw(/kokusnussmilch|kokosnussmilch|coconut\s+milk/)) title = '有机椰奶';
    else if (hasRaw(/palmiers?/)) title = '有机蝴蝶酥';
    else if (hasRaw(/sauerkraut/)) title = '有机酸菜';
    else if (hasCat(/cheeses?/)) title = '有机奶酪';
    else if (hasCat(/pastas?/)) title = '有机意面';
    else if (hasCat(/juices?|drinks?/)) title = '有机果汁';
    else if (hasCat(/vegetables?/)) title = '有机蔬菜';
    else if (hasCat(/bread|bakery|baked\s+goods/)) title = '有机面包';
    else if (hasCat(/peanut\s+butters?/)) title = '有机花生酱';
  }

  if (/^(鱼|鱼肉)$/.test(title)) {
    if (hasRaw(/\bgoldfish\b/)) title = '金鱼形饼干';
    else if (hasRaw(/swedish\s+fish/)) title = '瑞典鱼软糖';
    else if (hasCat(/crackers?|biscuits?/)) title = '鱼形饼干';
    else if (hasCat(/candies|gummies|chewy\s+candies/)) title = '鱼形软糖';
  }

  if (/^鸡肉$/.test(title)) {
    if (hasCat(/soups?|broths?/) || hasRaw(/soup|bouillon/)) title = '鸡汤';
    else if (hasCat(/noodles?|ramen|pastas?/) || hasRaw(/noodle|ramen|mein/)) title = '鸡肉面';
    else if (hasCat(/sandwich/)) title = '鸡肉三明治';
    else if (hasCat(/nuggets|breaded\s+products?/) || hasRaw(/nugget/)) title = '鸡块';
    else if (hasCat(/stocks?/)) title = '鸡汤底';
  }

  if (/^虾$/.test(title)) {
    if (hasCat(/chips|crisps|snacks?/) || hasRaw(/cracker|chip/)) title = '虾片';
    else if (hasCat(/noodles?|ramen/) || hasRaw(/noodle/)) title = '虾味面';
    else if (hasCat(/dumplings|dim\s*sum/) || hasRaw(/dumpling|gyoza|dim\s*sum/)) title = '虾饺';
  }

  if ((/^面包$/.test(title) || /^有机$/.test(title)) && hasCat(/peanut\s+butters?/)) {
    title = /creamy|smooth/.test(raw) ? '顺滑花生酱' : `${isOrganic ? '有机' : ''}花生酱`;
  }

  if ((/^谷物$/.test(title) || /^谷物片$/.test(title)) && hasCat(/breakfast\s+cereals?|cereals?/)) {
    title = '早餐谷物';
  }


  if (/^果汁$/.test(title)) {
    if (/smoothie/.test(raw)) title = fruitZh ? `${fruitZh}果昔` : '果汁奶昔';
    else if (/punch|multifruit/.test(raw)) title = '多种水果果汁';
    else if (/100\s*%|pur\s+jus/.test(raw)) title = fruitZh ? `100%${fruitZh}汁` : '100%果汁';
    else if (fruitZh && hasCat(/juices?|nectars?/)) title = `${fruitZh}汁`;
    else if (fruitZh && hasCat(/drinks?|beverages?/)) title = `${fruitZh}汁饮料`;
    else if (fruitZh) title = `${fruitZh}汁`;
  }

  if (/^酸奶$/.test(title)) {
    const yogurtFlavor = firstMatchLabel(raw, [
      [/lemon|citron/, '柠檬'],
      [/berry|baies|fruits\s+rouges|raspberry|strawberry|mixed\s+berry/, '莓果'],
      [/coffee|cafe/, '咖啡'],
      [/almond|amande/, '杏仁'],
    ]);
    if (/grec|greek/.test(raw)) title = `${/(low\s*fat|light|fettarm|all[ée]g[ée])/.test(raw) ? '低脂' : ''}希腊式酸奶`;
    else if (/brebis|sheep/.test(raw)) title = '羊奶酸奶';
    else if (/tube/.test(raw)) title = '管装酸奶';
    else if (yogurtFlavor) title = `${/(low\s*fat|light|fettarm|all[ée]g[ée])/.test(raw) ? '低脂' : ''}${yogurtFlavor}酸奶`;
    else if (/(low\s*fat|light|fettarm|all[ée]g[ée])/.test(raw)) title = '低脂酸奶';
  }

  if (/^面包$/.test(title) && breadZh) {
    title = `${isOrganic ? '有机' : ''}${breadZh}`;
  }
  if (/^面包$/.test(title) && /preparation|mix/.test(raw) && hasCat(/breads?|pains?/)) {
    title = `${isOrganic ? '有机' : ''}面包预拌粉`;
  }

  if (/^蔬菜$/.test(title)) {
    if (/gyoza/.test(raw)) title = '蔬菜煎饺';
    else if (/shortening/.test(raw)) title = '植物起酥油';
    else if (/medley/.test(raw)) title = '混合蔬菜';
    else if (/macedoine|macédoine/.test(raw)) title = '什锦蔬菜丁';
    else if (/moulin[ée]|soup|pot\s*au\s*feu/.test(raw) || hasCat(/soups?/)) title = '蔬菜浓汤';
    else if (/encurtid|pickled|cornichon/.test(raw)) title = '腌制混合蔬菜';
    else if (/vegetable\s+balls/.test(raw)) title = '蔬菜丸';
    else if (/nuggets?/.test(raw)) title = '蔬菜块';
    else if (/wok.*thai/.test(raw)) title = '泰式炒蔬菜';
  }

  if (/^鸡肉$/.test(title)) {
    if (/tikka\s+masala/.test(raw)) title = '鸡肉提卡玛莎拉';
    else if (/butter\s+chicken|murgh\s+makhani/.test(raw)) title = '黄油鸡';
    else if (/stock|broth|bouillon/.test(raw)) title = '鸡汤底';
    else if (/orange\s+chicken/.test(raw)) title = '陈皮鸡';
    else if (/arrabbiata/.test(raw)) title = '鸡肉阿拉比亚塔';
    else if (/sauce/.test(raw) && /chicken/.test(raw)) title = '鸡肉调味酱';
  }

  if (/^(奶酪|全脂奶酪|有机奶酪)$/.test(title)) {
    if (cheeseZh) title = `${isOrganic ? '有机' : ''}${cheeseZh}`;
    else if (/queso/.test(raw) && hasCat(/sauces?|spreads?/)) title = '奶酪酱';
    else if (/nacho\s+cheese/.test(raw) && hasCat(/chips|crisps|tortilla/)) title = '芝士味玉米片';
    else if (/ritz\s+bits/.test(raw) && hasCat(/snacks?|biscuits?|cookies?/)) title = '奶酪夹心饼干';
    else if (/bagel\s+bites/.test(raw)) title = '迷你贝果奶酪披萨';
    else if (/quattro\s+formaggio/.test(raw)) title = '四种奶酪';
    else if (/cheese\s+sauce/.test(raw) || hasCat(/cheese\s+spreads?/)) title = cheeseZh ? `${cheeseZh}酱` : '奶酪酱';
  }

  if (isOrganic && !/^有机/.test(title) && /(奶酪|果汁|意面|面包|花生酱|水果蛋糕|果味软糖|金鱼形饼干|瑞典鱼软糖|早餐谷物|杏仁奶|椰奶|燕麦奶|全脂牛奶|低脂牛奶|巧克力牛奶|牛奶巧克力)/.test(title)) {
    title = `有机${title}`;
  }

  return cleanupZh(title);
}


export function buildSmartFoodLabels(food, baseBuilder) {
  const base = typeof baseBuilder === 'function'
    ? baseBuilder(food)
    : (food?.labels || {
      zh: food?.z || '',
      en: food?.n || '',
      es: food?.n || '',
      original: food?.n || food?.z || '',
    });

  const original = String(food?.n || base?.original || food?.z || '').trim();
  if (!original) return { ...base };

  const raw = normalizeRaw(original);
  const baseZh = cleanupZh(base?.zh || food?.z || '');
  const nounInfo = detectNoun(raw, baseZh);
  const parts = detectParts(raw, nounInfo);

  let zh = baseZh;
  if (needsOverride(baseZh, nounInfo, parts, raw)) {
    zh = composeZh(nounInfo, parts);
  } else if (baseZh) {
    zh = enhanceBaseZh(baseZh, nounInfo, parts);
  }

  zh = cleanupZh(zh || baseZh || original);
  zh = applyContextZhCorrections(food, zh, raw) || zh;
  zh = refineZhWithCategory(food, zh, raw) || zh;
  if (/fromage\s+frais/.test(raw) && /贝果/.test(zh)) zh = cleanupZh(zh.replace(/^新鲜/, ''));
  if (!zh) zh = original;

  return {
    ...base,
    zh,
    original: base?.original || original,
  };
}
