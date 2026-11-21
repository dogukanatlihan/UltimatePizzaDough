export type Language = 'en' | 'tr';

// Every visible string, in both languages. Checked by src/utils/rules.check.ts.
export const translations: Record<string, Record<Language, string>> = {
  // Header
  'app.title': {
    en: 'Make Better Pizza',
    tr: 'Daha İyi Pizza Yap'
  },
  'app.footer': {
    en: 'Made with ❤️',
    tr: '❤️ ile Yapıldı'
  },
  
  // Measurement Units
  'units.title': {
    en: 'Measurement Units',
    tr: 'Ölçü Birimleri'
  },
  'units.centimeters': {
    en: 'Centimeters',
    tr: 'Santimetre'
  },
  'units.inches': {
    en: 'Inches',
    tr: 'İnç'
  },
  
  // Pizza Styles
  'style.title': {
    en: 'Pizza Style',
    tr: 'Pizza Stili'
  },
  'style.neapolitan': {
    en: 'Neapolitan',
    tr: 'Neapolitan'
  },
  'style.neapolitan.desc': {
    en: 'Traditional Italian style with a thin center and puffy, airy crust.',
    tr: 'İnce merkez ve kabarık, havadar kenar ile geleneksel İtalyan stili.'
  },
  'style.ny': {
    en: 'New York',
    tr: 'New York'
  },
  'style.ny.desc': {
    en: 'Thin, foldable slices with a crispy exterior and chewy interior.',
    tr: 'Çıtır dış ve çiğnenebilir iç yapıya sahip ince, katlanabilir dilimler.'
  },
  'style.newyork': {
    en: 'New York',
    tr: 'New York'
  },
  'style.newyork.desc': {
    en: 'Thin, foldable slices with a crispy exterior and chewy interior.',
    tr: 'Çıtır dış ve çiğnenebilir iç yapıya sahip ince, katlanabilir dilimler.'
  },
  'style.sicilian': {
    en: 'Sicilian',
    tr: 'Sicilian'
  },
  'style.sicilian.desc': {
    en: 'Thick, rectangular pizza with a fluffy, airy interior and crispy bottom.',
    tr: 'Kabarık, havadar iç yapı ve çıtır tabanıyla kalın, dikdörtgen pizza.'
  },
  'style.detroit': {
    en: 'Detroit',
    tr: 'Detroit'
  },
  'style.detroit.desc': {
    en: 'Rectangular pan pizza with a thick, airy crust and crispy cheese edges.',
    tr: 'Kalın, havadar hamur ve çıtır peynir kenarlarıyla dikdörtgen tava pizzası.'
  },
  'style.pan': {
    en: 'Pan',
    tr: 'Tava'
  },
  'style.pan.desc': {
    en: 'Pizza Hut-style thick, fluffy crust with a crispy, oil-fried bottom baked in a deep round pan.',
    tr: 'Derin yuvarlak tavada pişirilen, çıtır yağlı tabanıyla kalın ve kabarık Pizza Hut tarzı hamur.'
  },
  'style.focaccia': {
    en: 'Focaccia',
    tr: 'Focaccia'
  },
  'style.focaccia.desc': {
    en: 'Italian flatbread with a high hydration for an open, airy crumb.',
    tr: 'Açık, havadar gözenek yapısı için yüksek hidrasyonlu İtalyan yufka ekmeği.'
  },
  
  // Form Labels
  'form.numberOfPizzas': {
    en: 'Number of Pizzas',
    tr: 'Pizza Sayısı'
  },
  'form.pizzaDiameter': {
    en: 'Pizza Diameter',
    tr: 'Pizza Çapı'
  },
  'form.thicknessFactor': {
    en: 'Thickness Factor',
    tr: 'Kalınlık Faktörü'
  },
  'form.hydration': {
    en: 'Hydration',
    tr: 'Hidrasyon'
  },
  'form.salt': {
    en: 'Salt',
    tr: 'Tuz'
  },
  'form.yeast': {
    en: 'Yeast',
    tr: 'Maya'
  },
  'form.yeastType': {
    en: 'Yeast Type',
    tr: 'Maya Tipi'
  },
  'form.fresh': {
    en: 'Fresh',
    tr: 'Taze'
  },
  'form.active': {
    en: 'Active Dry',
    tr: 'Aktif Kuru'
  },
  'form.instant': {
    en: 'Instant',
    tr: 'Instant'
  },
  'form.oil': {
    en: 'Oil',
    tr: 'Yağ'
  },
  'form.sugar': {
    en: 'Sugar',
    tr: 'Şeker'
  },
  'form.preferment': {
    en: 'Preferment',
    tr: 'Ön Maya'
  },
  'form.none': {
    en: 'None',
    tr: 'Yok'
  },
  'form.poolish': {
    en: 'Poolish',
    tr: 'Poolish'
  },
  'form.biga': {
    en: 'Biga',
    tr: 'Biga'
  },
  'form.shape': {
    en: 'Shape',
    tr: 'Şekil'
  },
  'form.round': {
    en: 'Round',
    tr: 'Yuvarlak'
  },
  'form.rectangular': {
    en: 'Rectangular',
    tr: 'Dikdörtgen'
  },
  'form.length': {
    en: 'Length',
    tr: 'Uzunluk'
  },
  'form.width': {
    en: 'Width',
    tr: 'Genişlik'
  },
  'form.diastaticMalt': {
    en: 'Diastatic Malt',
    tr: 'Diastatik Malt'
  },
  'form.doughBallWeight': {
    en: 'Dough Ball Weight',
    tr: 'Hamur Topu Ağırlığı'
  },
  'form.thin': {
    en: 'Thin',
    tr: 'İnce'
  },
  'form.thick': {
    en: 'Thick',
    tr: 'Kalın'
  },
  'form.prefermentPercentage': {
    en: 'Preferment Percentage',
    tr: 'Ön Maya Yüzdesi'
  },
  'form.prefermentHydration': {
    en: 'Preferment Hydration',
    tr: 'Ön Maya Hidrasyonu'
  },
  
  // Buttons
  'button.reset': {
    en: 'Reset to Defaults',
    tr: 'Varsayılanlara Dön'
  },
  
  // Recipe Display
  'recipe.title': {
    en: 'Pizza Dough Recipe',
    tr: 'Pizza Hamuru Tarifi'
  },
  'recipe.info': {
    en: 'Pizza Info',
    tr: 'Pizza Bilgisi'
  },
  'recipe.diameter': {
    en: 'diameter',
    tr: 'çap'
  },
  'recipe.thickness': {
    en: 'thickness',
    tr: 'kalınlık'
  },
  'recipe.ingredients': {
    en: 'Ingredients',
    tr: 'Malzemeler'
  },
  'recipe.ingredient': {
    en: 'Ingredient',
    tr: 'Malzeme'
  },
  'recipe.weight': {
    en: 'Weight',
    tr: 'Ağırlık'
  },
  'recipe.percentage': {
    en: "Baker's %",
    tr: "Fırıncı %'si"
  },
  'recipe.flour': {
    en: 'Flour',
    tr: 'Un'
  },
  'recipe.water': {
    en: 'Water',
    tr: 'Su'
  },
  'recipe.total': {
    en: 'Total Dough Weight',
    tr: 'Toplam Hamur Ağırlığı'
  },
  'recipe.perPizza': {
    en: 'Per Pizza',
    tr: 'Pizza Başına'
  },
  
  // Method
  'method.title': {
    en: 'Method',
    tr: 'Yöntem'
  },
  'method.step1': {
    en: 'Mix flour and water until combined. Let rest for 30 minutes (autolyse).',
    tr: 'Un ve suyu karıştırın. 30 dakika dinlendirin (otoliz).'
  },
  'method.step2': {
    en: 'Add salt and yeast. Knead until smooth and elastic.',
    tr: 'Tuz ve maya ekleyin. Pürüzsüz ve esnek olana kadar yoğurun.'
  },
  'method.step3': {
    en: 'Bulk fermentation at room temperature for 1-2 hours.',
    tr: 'Oda sıcaklığında 1-2 saat toplu fermantasyon.'
  },
  'method.step4': {
    en: 'Divide into portions and shape into balls.',
    tr: 'Parçalara bölün ve top şekline getirin.'
  },
  'method.step5': {
    en: 'Cold fermentation in refrigerator for 24-72 hours.',
    tr: 'Buzdolabında 24-72 saat soğuk fermantasyon.'
  },
  'method.step6': {
    en: 'Bring to room temperature 1-2 hours before use.',
    tr: 'Kullanmadan 1-2 saat önce oda sıcaklığına getirin.'
  },
  
  // Recipe sections
  'recipe.preferment': {
    en: 'Preferment',
    tr: 'Ön Maya'
  },
  'recipe.mainDough': {
    en: 'Main Dough',
    tr: 'Ana Hamur'
  },
  'recipe.totalWeight': {
    en: 'Total Dough Weight',
    tr: 'Toplam Hamur Ağırlığı'
  },
  'recipe.perPizzaWeight': {
    en: 'Per Pizza',
    tr: 'Pizza Başına'
  },
  
  // Ingredient names - these are used for dynamic ingredient display
  'ingredient.flour': {
    en: 'Flour',
    tr: 'Un'
  },
  'ingredient.water': {
    en: 'Water',
    tr: 'Su'
  },
  'ingredient.salt': {
    en: 'Salt',
    tr: 'Tuz'
  },
  'ingredient.yeast': {
    en: 'Yeast',
    tr: 'Maya'
  },
  'ingredient.oil': {
    en: 'Oil',
    tr: 'Yağ'
  },
  'ingredient.sugar': {
    en: 'Sugar',
    tr: 'Şeker'
  },
  'ingredient.preferment': {
    en: 'Preferment',
    tr: 'Ön Maya'
  },
  'ingredient.diastaticMalt': {
    en: 'Diastatic Malt',
    tr: 'Diastatik Malt'
  },
  'ingredient.doughEnhancer': {
    en: 'Dough Enhancer',
    tr: 'Hamur İyileştirici'
  },
  
  // Empty states and messages
  'empty.title': {
    en: 'No Recipe Yet',
    tr: 'Henüz Tarif Yok'
  },
  'empty.message': {
    en: 'Adjust your pizza settings to generate a customized dough recipe with precise measurements and step-by-step instructions.',
    tr: 'Özelleştirilmiş bir hamur tarifi oluşturmak için pizza ayarlarınızı düzenleyin.'
  },
  'loading.recipe': {
    en: 'Calculating your perfect recipe...',
    tr: 'Mükemmel tarifiniz hesaplanıyor...'
  },
  
  // Style-specific preferment recommendations
  'preferment.hint.neapolitan': {
    en: 'Neapolitan pairs well with poolish (40% of flour, 12-16hr) or biga (50% of flour) for deeper flavor and better oven spring.',
    tr: 'Neapolitan, daha derin lezzet ve daha iyi fırın kabarması için poolish (unun %40\'ı, 12-16 saat) veya biga (unun %50\'si) ile iyi uyum sağlar.'
  },
  'preferment.hint.ny': {
    en: 'New York style benefits from poolish (40% of flour) for flavor complexity, or a sponge (60% of flour) for faster same-day prep.',
    tr: 'New York stili, lezzet karmaşıklığı için poolish (unun %40\'ı) veya aynı gün hazırlık için sünger (unun %60\'ı) ile iyi sonuç verir.'
  },
  'preferment.hint.sicilian': {
    en: 'Sicilian thick crust benefits from higher preferment amounts (50-65% of flour) for a lighter, airier crumb.',
    tr: 'Sicilian kalın kenar, daha hafif ve havadar gözenek için yüksek ön maya miktarından (unun %50-65\'i) fayda görür.'
  },
  'preferment.hint.detroit': {
    en: 'Detroit style works great with poolish (45% of flour) or biga (50% of flour) for an open, airy crumb.',
    tr: 'Detroit stili, açık ve havadar gözenek için poolish (unun %45\'i) veya biga (unun %50\'si) ile harika sonuç verir.'
  },
  'preferment.hint.pan': {
    en: 'Pan pizza is traditionally a straight dough, but a sponge (60% of flour) adds softness, or poolish (45% of flour) develops flavor without overpowering the buttery character.',
    tr: 'Tava pizza geleneksel olarak düz hamurdur, ancak sünger (unun %60\'ı) yumuşaklık katar veya poolish (unun %45\'i) tereyağlı karakteri bastırmadan lezzet geliştirir.'
  },
  'preferment.hint.focaccia': {
    en: 'Focaccia traditionally uses biga (60% of flour) for structure, or poolish (50% of flour) for maximum open crumb.',
    tr: 'Focaccia geleneksel olarak yapı için biga (unun %60\'ı) veya maksimum açık gözenek için poolish (unun %50\'si) kullanır.'
  },

  // Preferment section
  'preferment.title': {
    en: 'Preferment & Main Dough',
    tr: 'Ön Maya & Ana Hamur'
  },
  'preferment.info': {
    en: 'Prepare the preferment first and let it ferment before mixing with the main dough ingredients.',
    tr: 'Önce ön mayayı hazırlayın ve ana hamur malzemeleriyle karıştırmadan önce mayalanmasını bekleyin.'
  },
  'preferment.waterWarning': {
    en: 'The preferment holds more water than the whole dough, so the main dough water is negative. Lower the preferment % or its hydration, or raise the total hydration.',
    tr: 'Ön maya, hamurun tamamından daha fazla su içeriyor; bu yüzden ana hamur suyu eksiye düşüyor. Ön maya yüzdesini veya hidrasyonunu düşürün ya da toplam hidrasyonu artırın.'
  },
  'recipe.copied': {
    en: 'Recipe copied to clipboard',
    tr: 'Tarif panoya kopyalandı'
  },
  'recipe.copyFailed': {
    en: 'Could not copy the recipe',
    tr: 'Tarif kopyalanamadı'
  },
  'preferment.instructions': {
    en: 'Preferment Instructions',
    tr: 'Ön Maya Talimatları'
  },
  'mainDough.instructions': {
    en: 'Main Dough Instructions',
    tr: 'Ana Hamur Talimatları'
  },
  'dough.instructions': {
    en: 'Dough Instructions',
    tr: 'Hamur Talimatları'
  },
  'baking.instructions': {
    en: 'Baking Instructions',
    tr: 'Pişirme Talimatları'
  },
  
  // Method steps for preferment
  'preferment.step1': {
    en: 'Mix {flour}g ({flourOz}oz) flour with {water}g ({waterOz}oz) water{yeast} until no dry flour remains.',
    tr: '{flour}g ({flourOz}oz) unu {water}g ({waterOz}oz) su{yeast} ile kuru un kalmayana kadar karıştırın.'
  },
  'preferment.step1.yeast': {
    en: ' and {yeast}g ({yeastOz}oz) yeast',
    tr: ' ve {yeast}g ({yeastOz}oz) maya'
  },
  'preferment.step2.sponge': {
    en: 'Cover and let ferment in a warm place (75-84°F/24-29°C) for 3-5 hours.',
    tr: 'Kapatın ve ılık bir yerde (24-29°C) 3-5 saat mayalanmaya bırakın.'
  },
  'preferment.step2.poolish': {
    en: 'Cover and let ferment at room temperature (68-72°F/20-22°C) for about 12 hours.',
    tr: 'Kapatın ve oda sıcaklığında (20-22°C) yaklaşık 12 saat mayalanmaya bırakın.'
  },
  'preferment.step3.sponge': {
    en: 'The preferment is ready when it has a domed surface with many small bubbles.',
    tr: 'Ön maya, üzerinde birçok küçük kabarcık olan kubbeli bir yüzeye sahip olduğunda hazırdır.'
  },
  'preferment.step3.poolish': {
    en: 'The preferment is ready when it has doubled in size and has a domed or slightly collapsed surface with bubbles.',
    tr: 'Ön maya, boyutunun iki katına çıktığında ve üzerinde kabarcıklar olan kubbeli veya hafifçe çökmüş bir yüzeye sahip olduğunda hazırdır.'
  },
  
  // Main dough steps
  'mainDough.step1': {
    en: 'In a large bowl, combine the preferment with {water}g ({waterOz}oz) water and mix until the preferment is dissolved.',
    tr: 'Büyük bir kapta ön mayayı {water}g ({waterOz}oz) su ile karıştırın ve ön maya çözülene kadar karıştırmaya devam edin.'
  },
  'mainDough.step2': {
    en: 'Add {flour}g ({flourOz}oz) flour and mix until no dry flour remains. Cover and let rest for 30 minutes (autolyse).',
    tr: '{flour}g ({flourOz}oz) un ekleyin ve kuru un kalmayana kadar karıştırın. Kapatın ve 30 dakika dinlendirin (otoliz).'
  },
  'mainDough.step3.start': {
    en: 'Add {salt}g ({saltOz}oz) salt',
    tr: '{salt}g ({saltOz}oz) tuz'
  },
  'mainDough.step3.yeast': {
    en: ', {yeast}g ({yeastOz}oz) yeast',
    tr: ', {yeast}g ({yeastOz}oz) maya'
  },
  'mainDough.step3.oil': {
    en: ', {oil}g ({oilOz}oz) oil',
    tr: ', {oil}g ({oilOz}oz) yağ'
  },
  'mainDough.step3.sugar': {
    en: ' and {sugar}g ({sugarOz}oz) sugar',
    tr: ' ve {sugar}g ({sugarOz}oz) şeker'
  },
  'mainDough.step3.malt': {
    en: ' and {malt}g ({maltOz}oz) diastatic malt',
    tr: ' ve {malt}g ({maltOz}oz) diastatik malt'
  },
  'mainDough.step3.enhancer': {
    en: ' and {enhancer}g ({enhancerOz}oz) dough enhancer',
    tr: ' ve {enhancer}g ({enhancerOz}oz) hamur iyileştirici'
  },
  'mainDough.step3.end': {
    en: ' and mix thoroughly.',
    tr: ' ekleyin ve iyice karıştırın.'
  },
  'mainDough.step4': {
    en: 'Perform 3-4 sets of stretch and folds at 30-minute intervals.',
    tr: '30 dakikalık aralıklarla 3-4 set germe ve katlama yapın.'
  },
  'mainDough.step5': {
    en: 'After the final fold, let the dough bulk ferment until it has increased in volume by about 50% (2-4 hours depending on temperature).',
    tr: 'Son katlamadan sonra, hamurun hacmi yaklaşık %50 artana kadar mayalanmaya bırakın (sıcaklığa bağlı olarak 2-4 saat).'
  },
  'mainDough.step6': {
    en: 'Divide the dough into individual balls and shape them.',
    tr: 'Hamuru tek tek toplar halinde bölün ve şekillendirin.'
  },
  'mainDough.step7': {
    en: 'Place the dough balls in containers and refrigerate for 24-72 hours for cold fermentation.',
    tr: 'Hamur toplarını kaplara yerleştirin ve soğuk fermantasyon için 24-72 saat buzdolabında bekletin.'
  },
  'mainDough.step8': {
    en: 'Remove from the refrigerator 1-2 hours before baking to allow the dough to warm up.',
    tr: 'Hamurun ısınması için pişirmeden 1-2 saat önce buzdolabından çıkarın.'
  },
  
  // Simple dough steps
  'dough.step1': {
    en: 'In a large bowl, combine {water}g ({waterOz}oz) water with {flour}g ({flourOz}oz) flour and mix until no dry flour remains.',
    tr: 'Büyük bir kapta {water}g ({waterOz}oz) suyu {flour}g ({flourOz}oz) un ile kuru un kalmayana kadar karıştırın.'
  },
  'dough.step2': {
    en: 'Cover and let rest for 30 minutes (autolyse). This allows the flour to fully hydrate and begins gluten development.',
    tr: 'Kapatın ve 30 dakika dinlendirin (otoliz). Bu, unun tamamen su emmesini ve glüten gelişiminin başlamasını sağlar.'
  },
  'dough.step3.salt': {
    en: 'Add {salt}g ({saltOz}oz) salt and incorporate thoroughly.',
    tr: '{salt}g ({saltOz}oz) tuz ekleyin ve iyice karıştırın.'
  },
  'dough.step3.yeast': {
    en: 'Add {yeast}g ({yeastOz}oz) {yeastName} and mix thoroughly.',
    tr: '{yeast}g ({yeastOz}oz) {yeastName} ekleyin ve iyice karıştırın.'
  },
  'dough.step3.oil': {
    en: 'Add {oil}g ({oilOz}oz) oil and mix thoroughly.',
    tr: '{oil}g ({oilOz}oz) yağ ekleyin ve iyice karıştırın.'
  },
  'dough.step3.sugar': {
    en: 'Add {sugar}g ({sugarOz}oz) sugar and mix thoroughly.',
    tr: '{sugar}g ({sugarOz}oz) şeker ekleyin ve iyice karıştırın.'
  },
  'dough.step3.malt': {
    en: 'Add {malt}g ({maltOz}oz) diastatic malt and mix thoroughly.',
    tr: '{malt}g ({maltOz}oz) diastatik malt ekleyin ve iyice karıştırın.'
  },
  'dough.step3.enhancer': {
    en: 'Add {enhancer}g ({enhancerOz}oz) dough enhancer and mix thoroughly.',
    tr: '{enhancer}g ({enhancerOz}oz) hamur iyileştirici ekleyin ve iyice karıştırın.'
  },
  
  // Flour type recommendations
  'flour.neapolitan': {
    en: 'Recommended flour: Tipo 00 (such as Caputo Pizzeria) with ~12.5% protein for authentic Neapolitan results.',
    tr: 'Önerilen un: Otantik Neapolitan sonuçlar için ~%12.5 proteinli Tipo 00 (Caputo Pizzeria gibi).'
  },
  'flour.ny': {
    en: 'Recommended flour: High-gluten bread flour (14%+ protein) for that classic chewy, foldable New York slice.',
    tr: 'Önerilen un: Klasik çiğnenebilir, katlanabilir New York dilimi için yüksek glütenli ekmek unu (%14+ protein).'
  },
  'flour.sicilian': {
    en: 'Recommended flour: Bread flour (12-13% protein) for a sturdy yet airy thick crust.',
    tr: 'Önerilen un: Sağlam ama havadar kalın kenar için ekmek unu (%12-13 protein).'
  },
  'flour.detroit': {
    en: 'Recommended flour: Bread flour (12-13% protein) for proper structure in the thick, airy crust.',
    tr: 'Önerilen un: Kalın, havadar kenarda doğru yapı için ekmek unu (%12-13 protein).'
  },
  'flour.pan': {
    en: 'Recommended flour: Bread flour (12-13% protein) for a chewy yet fluffy interior with good structure.',
    tr: 'Önerilen un: İç yapıda çiğnenebilir ama kabarık doku ve iyi yapı için ekmek unu (%12-13 protein).'
  },
  'flour.focaccia': {
    en: 'Recommended flour: All-purpose or bread flour (11-13% protein) works well for focaccia.',
    tr: 'Önerilen un: Çok amaçlı veya ekmek unu (%11-13 protein) focaccia için iyi sonuç verir.'
  },

  // Baking steps - style-specific
  'baking.step1': {
    en: 'Preheat your oven to the highest temperature (ideally 500-550°F/260-290°C) with a pizza stone or steel for at least 1 hour.',
    tr: 'Fırınınızı en yüksek sıcaklığa (ideal olarak 260-290°C) ısıtın ve pizza taşı veya çeliğini en az 1 saat önceden ısıtın.'
  },
  'baking.step1.neapolitan': {
    en: 'For authentic Neapolitan pizza, a wood-fired oven at 805-905°F (430-485°C) is ideal. For home ovens, preheat to maximum (500-550°F/260-290°C) with a pizza stone or steel for at least 1 hour.',
    tr: 'Otantik Neapolitan pizza için 430-485°C odun ateşli fırın idealdir. Ev fırınları için pizza taşı veya çeliği ile en yüksek sıcaklığa (260-290°C) en az 1 saat önceden ısıtın.'
  },
  'baking.step1.detroit': {
    en: 'Preheat your oven to 500-525°F (260-275°C). The pizza bakes in the well-oiled Detroit-style steel pan (or dark deep pan) it has risen in.',
    tr: 'Fırınınızı 260-275°C\'ye ısıtın. Pizza, içinde mayalandığı iyice yağlanmış Detroit tarzı çelik tavada (veya koyu renkli derin tavada) pişer.'
  },
  'baking.step1.sicilian': {
    en: 'Preheat your oven to 450°F (230°C). The pizza bakes in the well-oiled sheet pan it has risen in.',
    tr: 'Fırınınızı 230°C\'ye ısıtın. Pizza, içinde mayalandığı iyice yağlanmış tepside pişer.'
  },
  'baking.step1.pan': {
    en: 'Preheat your oven to 550°F (290°C). The pizza bakes in the generously oiled deep round pan or cast iron skillet it has risen in — the oil fries the bottom for that signature crispy crust.',
    tr: 'Fırınınızı 290°C\'ye ısıtın. Pizza, içinde mayalandığı bol yağlanmış derin yuvarlak tavada veya döküm tavada pişer — yağ, tabanı kızartarak o karakteristik çıtır kabuğu oluşturur.'
  },
  'baking.step2': {
    en: 'Gently stretch the dough to your desired size without deflating it too much.',
    tr: 'Hamuru fazla havasını çıkarmadan nazikçe istediğiniz boyuta gerin.'
  },
  'baking.step2.neapolitan': {
    en: 'Gently stretch the dough by hand from the center outward, leaving the cornicione (edge) untouched for a puffy rim. Never use a rolling pin.',
    tr: 'Hamuru merkezden dışa doğru nazikçe elle gerin, kabarık kenar (cornicione) için kenarına dokunmayın. Asla oklava kullanmayın.'
  },
  'baking.step3': {
    en: 'Add your toppings and transfer to the hot stone/steel.',
    tr: 'Malzemelerinizi ekleyin ve sıcak taş/çeliğe aktarın.'
  },
  'baking.step4': {
    en: 'Bake until the crust is golden and the cheese is bubbly (typically 5-8 minutes).',
    tr: 'Kenar altın rengi olana ve peynir köpürene kadar pişirin (genellikle 5-8 dakika).'
  },
  'baking.step4.neapolitan': {
    en: 'Bake until leopard-spotted charring appears on the crust (60-90 seconds in wood-fired oven, 5-7 minutes in home oven).',
    tr: 'Kenarda leopar benekli yanık noktalar oluşana kadar pişirin (odun fırında 60-90 saniye, ev fırınında 5-7 dakika).'
  },
  'baking.step4.pan': {
    en: 'Bake on the lowest rack for 12-15 minutes until the crust is deep golden and the cheese is bubbly. The oiled pan creates a crispy, fried bottom.',
    tr: 'En alt rafta 12-15 dakika, kenar koyu altın rengi olana ve peynir köpürene kadar pişirin. Yağlı tava çıtır, kızarmış bir taban oluşturur.'
  },
  'baking.step3.focaccia': {
    en: 'Dimple the dough with your fingers, drizzle generously with olive oil, and sprinkle with flaky salt.',
    tr: 'Hamuru parmaklarınızla bastırarak çukurlar oluşturun, bol zeytinyağı gezdirin ve pul tuz serpin.'
  },
  'baking.step4.focaccia': {
    en: 'Bake for 20-25 minutes until the top is deep golden and crispy. Let cool slightly before slicing.',
    tr: '20-25 dakika, üstü koyu altın rengi ve çıtır olana kadar pişirin. Dilimlemeden önce biraz soğumaya bırakın.'
  },
  'baking.step3.sicilian': {
    en: 'Add sauce and toppings to the dough in the pan. Cheese is typically added after baking or in the last few minutes.',
    tr: 'Tepsideki hamura sos ve malzemeleri ekleyin. Peynir genellikle pişirdikten sonra veya son birkaç dakikada eklenir.'
  },
  'baking.step4.sicilian': {
    en: 'Bake for 20-30 minutes until the bottom is crispy and the crust is deep golden. Add cheese after removing from the oven if desired.',
    tr: '20-30 dakika, alt kısmı çıtır ve kenar koyu altın rengi olana kadar pişirin. İsterseniz fırından çıkardıktan sonra peynir ekleyin.'
  },
  'baking.step3.detroit': {
    en: 'Add brick cheese or a blend of cheeses to the edges of the pan first, then add sauce in racing stripes on top.',
    tr: 'Önce tavanın kenarlarına tuğla peyniri veya karışık peynir ekleyin, ardından üzerine şeritler halinde sos ekleyin.'
  },
  'baking.step4.detroit': {
    en: 'Bake for 12-15 minutes until the cheese edges are deeply caramelized and crispy. The cheese touching the pan creates the signature frico crust.',
    tr: '12-15 dakika, peynir kenarları iyice karamelize olana ve çıtır olana kadar pişirin. Tavaya dokunan peynir karakteristik frico kabuğu oluşturur.'
  },

  // Method and baking steps that follow each style's sources (AVPN/EU, Lehmann, pan-pizza formulas)
  'dough.direct.step1': {
    en: 'Pour {water}g ({waterOz}oz) water into a large bowl and dissolve {salt}g ({saltOz}oz) salt in it.',
    tr: '{water}g ({waterOz}oz) suyu büyük bir kaba dökün ve içinde {salt}g ({saltOz}oz) tuzu eritin.'
  },
  'dough.direct.step2': {
    en: 'Add about a tenth of the {flour}g ({flourOz}oz) flour and mix.',
    tr: '{flour}g ({flourOz}oz) unun yaklaşık onda birini ekleyip karıştırın.'
  },
  'dough.direct.step3': {
    en: 'Add the rest of the flour a little at a time, over about 10 minutes.',
    tr: 'Kalan unu yaklaşık 10 dakika içinde azar azar ekleyin.'
  },
  'method.neapolitan.knead': {
    en: 'Knead for about 20 minutes (mixer on low speed) until the dough is smooth, soft and elastic.',
    tr: 'Hamur pürüzsüz, yumuşak ve elastik olana kadar yaklaşık 20 dakika yoğurun (mikserde düşük hızda).'
  },
  'method.neapolitan.rest': {
    en: 'Cover with a damp cloth and let the dough rest for 2 hours.',
    tr: 'Üzerini nemli bir bezle örtün ve hamuru 2 saat dinlendirin.'
  },
  'method.neapolitan.balls': {
    en: 'Divide the dough into balls and place them in a covered proofing box.',
    tr: 'Hamuru toplara bölün ve kapaklı bir mayalama kutusuna dizin.'
  },
  'method.neapolitan.proof': {
    en: 'Let the balls rise for 4-6 hours at room temperature. Use them within the next 6 hours.',
    tr: 'Topları oda sıcaklığında 4-6 saat mayalandırın. Sonraki 6 saat içinde kullanın.'
  },
  'method.ny.knead': {
    en: 'Knead until the dough is smooth and elastic.',
    tr: 'Hamur pürüzsüz ve elastik olana kadar yoğurun.'
  },
  'method.ny.balls': {
    en: 'Divide the dough into balls straight after kneading and place them in covered containers.',
    tr: 'Yoğurduktan hemen sonra hamuru toplara bölün ve kapaklı kaplara yerleştirin.'
  },
  'method.ny.cold': {
    en: 'Refrigerate for 24-72 hours.',
    tr: '24-72 saat buzdolabında bekletin.'
  },
  'method.ny.temper': {
    en: 'Take the balls out of the refrigerator 2-3 hours before baking.',
    tr: 'Topları pişirmeden 2-3 saat önce buzdolabından çıkarın.'
  },
  'method.pan.piece': {
    en: 'Keep the dough for each pan in one piece and place it in a lightly oiled, covered container.',
    tr: 'Her tava için hamuru tek parça bırakın ve hafifçe yağlanmış, kapaklı bir kaba koyun.'
  },
  'method.pan.cold': {
    en: 'Refrigerate for 24-72 hours.',
    tr: '24-72 saat buzdolabında bekletin.'
  },
  'method.pan.proof.sicilian': {
    en: 'Press the cold dough into a well-oiled sheet pan. If it springs back, let it rest for 20-30 minutes, then stretch it to the corners. Cover and let it rise in the pan for 1.5-2 hours, until puffy.',
    tr: 'Soğuk hamuru iyice yağlanmış tepsiye bastırarak yayın. Geri çekiliyorsa 20-30 dakika dinlendirin, sonra köşelere kadar açın. Üzerini örtün ve kabarana kadar tepside 1,5-2 saat mayalandırın.'
  },
  'method.pan.proof.detroit': {
    en: 'Press the cold dough into a well-oiled pan. If it springs back, let it rest for 20-30 minutes, then stretch it to the corners. Cover and let it rise in the pan for 2-3 hours, until puffy.',
    tr: 'Soğuk hamuru iyice yağlanmış tavaya bastırarak yayın. Geri çekiliyorsa 20-30 dakika dinlendirin, sonra köşelere kadar açın. Üzerini örtün ve kabarana kadar tavada 2-3 saat mayalandırın.'
  },
  'method.pan.proof.pan': {
    en: 'Press the cold dough into a generously oiled pan. If it springs back, let it rest for 20-30 minutes, then stretch it to the edge. Cover and let it rise in the pan for about 2 hours, until puffy.',
    tr: 'Soğuk hamuru bol yağlanmış tavaya bastırarak yayın. Geri çekiliyorsa 20-30 dakika dinlendirin, sonra kenarlara kadar açın. Üzerini örtün ve kabarana kadar tavada yaklaşık 2 saat mayalandırın.'
  },
  'method.pan.proof.focaccia': {
    en: 'Press the cold dough into a well-oiled pan. If it springs back, let it rest for 20-30 minutes, then stretch it to the edges. Cover and let it rise in the pan for 1-3 hours, until puffy and bubbly.',
    tr: 'Soğuk hamuru iyice yağlanmış tavaya bastırarak yayın. Geri çekiliyorsa 20-30 dakika dinlendirin, sonra kenarlara kadar açın. Üzerini örtün ve kabarıp gözeneklenene kadar tavada 1-3 saat mayalandırın.'
  },
  'preferment.step1.sourdough': {
    en: 'Mix {flour}g ({flourOz}oz) flour and {water}g ({waterOz}oz) water with a spoonful of ripe sourdough starter until no dry flour remains.',
    tr: '{flour}g ({flourOz}oz) un ve {water}g ({waterOz}oz) suyu bir kaşık olgun ekşi maya ile kuru un kalmayana kadar karıştırın.'
  },
  'preferment.step2.sourdough': {
    en: 'Cover and let it ferment at room temperature until it has doubled. How long this takes depends on your starter.',
    tr: 'Kapatın ve iki katına çıkana kadar oda sıcaklığında mayalanmaya bırakın. Süre ekşi mayanıza bağlıdır.'
  },
  'time.sourdough': {
    en: 'until doubled',
    tr: 'iki katına çıkana kadar'
  },
  'mainDough.step2.neapolitan': {
    en: 'Add {flour}g ({flourOz}oz) flour a little at a time and mix until no dry flour remains.',
    tr: '{flour}g ({flourOz}oz) unu azar azar ekleyin ve kuru un kalmayana kadar karıştırın.'
  },
  'time.dough.neapolitan': {
    en: 'Same day · 6–8 h rise',
    tr: 'Aynı gün · 6–8 sa mayalanma'
  },
  'baking.step1.focaccia': {
    en: 'Preheat your oven to 450°F (230°C). Focaccia bakes in the well-oiled pan it has risen in.',
    tr: 'Fırınınızı 230°C\'ye ısıtın. Focaccia, içinde mayalandığı iyice yağlanmış tavada pişer.'
  },
  'baking.step2.inPan': {
    en: 'The dough has already risen in the pan: do not press the air out of it.',
    tr: 'Hamur tavada zaten mayalandı: havasını söndürmeyin.'
  },
  'baking.step2.focaccia': {
    en: 'The dough has already risen in the pan and should look puffy and bubbly.',
    tr: 'Hamur tavada zaten mayalandı; kabarık ve gözenekli görünmelidir.'
  },
  'baking.step3.pan': {
    en: 'Add sauce, cheese and toppings to the dough in the pan.',
    tr: 'Tavadaki hamurun üzerine sos, peynir ve malzemeleri ekleyin.'
  },

  // Tre Passi screens
  'nav.steps': {
    en: 'Steps',
    tr: 'Adımlar'
  },
  'step.style': {
    en: 'Style',
    tr: 'Stil'
  },
  'step.size': {
    en: 'Size',
    tr: 'Boyut'
  },
  'step.recipe': {
    en: 'Recipe',
    tr: 'Tarif'
  },
  'step.of': {
    en: 'Step {n} of 3',
    tr: 'Adım {n} / 3'
  },
  's1.title': {
    en: 'Which pizza are you making?',
    tr: 'Hangi pizzayı yapıyorsunuz?'
  },
  'style.neapolitan.short': {
    en: 'Thin centre, puffy airy rim.',
    tr: 'İnce orta, kabarık ve havadar kenar.'
  },
  'style.ny.short': {
    en: 'Big foldable slices, crisp outside.',
    tr: 'Büyük, katlanabilir dilimler; dışı çıtır.'
  },
  'style.sicilian.short': {
    en: 'Thick rectangle, fluffy inside, crisp bottom.',
    tr: 'Kalın ve dikdörtgen; içi pofuduk, altı çıtır.'
  },
  'style.detroit.short': {
    en: 'Airy pan pizza with caramelised cheese edges.',
    tr: 'Havadar tava pizzası, karamelize peynirli kenarlar.'
  },
  'style.pan.short': {
    en: 'Thick fluffy crust, fried crisp in an oiled pan.',
    tr: 'Kalın, pofuduk hamur; yağlı tavada çıtır taban.'
  },
  'style.focaccia.short': {
    en: 'Wet dough, open airy crumb, lots of olive oil.',
    tr: 'Sulu hamur, gözenekli iç, bol zeytinyağı.'
  },
  's2.title': {
    en: 'How many, and how big?',
    tr: 'Kaç tane ve ne büyüklükte?'
  },
  'chip.change': {
    en: 'Change',
    tr: 'Değiştir'
  },
  'size.pizzas': {
    en: 'Pizzas',
    tr: 'Pizza sayısı'
  },
  'size.diameter': {
    en: 'Diameter',
    tr: 'Çap'
  },
  'size.panWidth': {
    en: 'Pan width',
    tr: 'Tava genişliği'
  },
  'size.panLength': {
    en: 'Pan length',
    tr: 'Tava uzunluğu'
  },
  'size.shape': {
    en: 'Shape',
    tr: 'Şekil'
  },
  'size.rectPan': {
    en: 'Rectangular pan',
    tr: 'Dikdörtgen tava'
  },
  'size.measureIn': {
    en: 'Measure in',
    tr: 'Ölçü birimi'
  },
  'crust.label': {
    en: 'Crust',
    tr: 'Hamur kalınlığı'
  },
  'crust.thin': {
    en: 'Thin',
    tr: 'İnce'
  },
  'crust.medium': {
    en: 'Medium',
    tr: 'Orta'
  },
  'crust.thick': {
    en: 'Thick',
    tr: 'Kalın'
  },
  'crust.extraThick': {
    en: 'Extra thick',
    tr: 'Çok kalın'
  },
  'crust.ball': {
    en: 'Each dough ball: {g}',
    tr: 'Her hamur topu: {g}'
  },
  'a11y.less': {
    en: 'Less',
    tr: 'Azalt'
  },
  'a11y.more': {
    en: 'More',
    tr: 'Artır'
  },
  's3.title': {
    en: 'Your recipe',
    tr: 'Tarifiniz'
  },
  'recipe.totalDough': {
    en: 'Total dough',
    tr: 'Toplam hamur'
  },
  'stage.dayBefore': {
    en: 'First · {name}',
    tr: 'Önce · {name}'
  },
  'stage.bakingDay': {
    en: 'Then · main dough',
    tr: 'Sonra · ana hamur'
  },
  'water.label': {
    en: 'Water in the dough',
    tr: 'Hamurdaki su'
  },
  'water.firmer': {
    en: 'Firmer',
    tr: 'Daha sıkı'
  },
  'water.wetter': {
    en: 'Wetter',
    tr: 'Daha sulu'
  },
  'water.feel.firm': {
    en: 'Firm and easy to shape.',
    tr: 'Sıkı, kolay şekil alır.'
  },
  'water.feel.classic': {
    en: 'Classic and balanced.',
    tr: 'Klasik ve dengeli.'
  },
  'water.feel.soft': {
    en: 'Soft and airy, a little sticky.',
    tr: 'Yumuşak ve havadar, biraz yapışkan.'
  },
  'water.feel.wet': {
    en: 'Very wet. Best baked in a pan.',
    tr: 'Çok sulu. En iyisi tavada pişirmek.'
  },
  'tune.title': {
    en: 'Fine-tune',
    tr: 'İnce ayar'
  },
  'tune.sub': {
    en: 'Salt, yeast, oil, sugar',
    tr: 'Tuz, maya, yağ, şeker'
  },
  'form.doughEnhancer': {
    en: 'Dough enhancer',
    tr: 'Hamur iyileştirici'
  },
  'form.sponge': {
    en: 'Sponge',
    tr: 'Sünger'
  },
  'form.sourdough': {
    en: 'Sourdough',
    tr: 'Ekşi maya'
  },
  'pref.sub.none': {
    en: 'Optional. More flavour.',
    tr: 'İsteğe bağlı. Daha fazla lezzet.'
  },
  'pref.sub.on': {
    en: '{name} · {pct} of the flour',
    tr: '{name} · unun {pct} kadarı'
  },
  'pref.type': {
    en: 'Make part of the dough the day before',
    tr: 'Hamurun bir kısmını bir gün önce hazırlayın'
  },
  'pref.share': {
    en: 'Share of the flour',
    tr: 'Ön mayadaki un oranı'
  },
  'pref.water': {
    en: 'Water in the preferment',
    tr: 'Ön mayadaki su'
  },
  'pref.hint': {
    en: 'Poolish about 100%, biga 50–60%, sponge 60–65%.',
    tr: 'Poolish yaklaşık %100, biga %50–60, sünger %60–65.'
  },
  'pref.flourWater': {
    en: '{flour} flour · {water} water',
    tr: '{flour} un · {water} su'
  },
  'method.one': {
    en: 'One stage',
    tr: 'Tek aşama'
  },
  'method.two': {
    en: 'Two stages',
    tr: 'İki aşama'
  },
  'bake.title': {
    en: 'Baking',
    tr: 'Pişirme'
  },
  'bake.oven': {
    en: 'Oven',
    tr: 'Fırın'
  },
  'bake.time': {
    en: 'Time',
    tr: 'Süre'
  },
  'bake.flour': {
    en: 'Flour',
    tr: 'Un'
  },
  'unit.min': {
    en: 'min',
    tr: 'dk'
  },
  'unit.sec': {
    en: 's',
    tr: 'sn'
  },
  'action.copy': {
    en: 'Copy recipe',
    tr: 'Tarifi kopyala'
  },
  'action.copied': {
    en: 'Copied',
    tr: 'Kopyalandı'
  },
  'action.print': {
    en: 'Print',
    tr: 'Yazdır'
  },
  'copy.hydration': {
    en: 'Hydration {pct}',
    tr: 'Hidrasyon {pct}'
  },
  'bar.next': {
    en: 'Next: size',
    tr: 'Sonraki: boyut'
  },
  'bar.see': {
    en: 'See recipe',
    tr: 'Tarifi gör'
  },
  'bar.back': {
    en: 'Back',
    tr: 'Geri'
  },
  'bar.dough': {
    en: '{g} dough',
    tr: '{g} hamur'
  },
  'bar.flour': {
    en: 'Flour {g}',
    tr: 'Un {g}'
  },
  'bar.water': {
    en: 'Water {g}',
    tr: 'Su {g}'
  },
  'footer.startOver': {
    en: 'Start over',
    tr: 'Baştan başla'
  },
  'toast.startedOver': {
    en: 'Started over.',
    tr: 'Baştan başlandı.'
  },
  'toast.undo': {
    en: 'Undo',
    tr: 'Geri al'
  },
  'a2hs.button': {
    en: 'Add to Home Screen',
    tr: 'Ana ekrana ekle'
  },
  'a2hs.ios': {
    en: 'Tap the Share button, then "Add to Home Screen".',
    tr: 'Paylaş düğmesine, ardından "Ana Ekrana Ekle"ye dokunun.'
  },
  'theme.toLight': {
    en: 'Switch to light mode',
    tr: 'Açık temaya geç'
  },
  'theme.toDark': {
    en: 'Switch to dark mode',
    tr: 'Koyu temaya geç'
  },
  'lang.toTurkish': {
    en: 'Switch to Turkish',
    tr: 'Türkçeye geç'
  },
  'lang.toEnglish': {
    en: 'Switch to English',
    tr: 'İngilizceye geç'
  },
  'time.poolish': {
    en: 'about 12 h',
    tr: 'yaklaşık 12 sa'
  },
  'time.sponge': {
    en: '3–5 h',
    tr: '3–5 sa'
  },
  'time.dough': {
    en: '1–3 days in the fridge',
    tr: '1–3 gün buzdolabında'
  },
};

// {name} placeholders are filled from `vars`. A key with no entry comes back as the key.
export const translate = (language: Language, key: string, vars?: Record<string, string | number>): string => {
  const text = translations[key]?.[language] || key;
  return vars ? text.replace(/\{(\w+)\}/g, (whole, name) => (name in vars ? String(vars[name]) : whole)) : text;
};

export type Translate = (key: string, vars?: Record<string, string | number>) => string;
