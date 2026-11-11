/**
 * Real food photos, all free under the Unsplash License
 * (https://unsplash.com/license: commercial use allowed, no permission or credit required).
 * Key = product id or department id. `src` is the Unsplash image id, `page` the photo page on unsplash.com.
 * Sponsored products have no photo: they keep their illustration (fictional brands).
 */
export interface Photo {
  src: string;
  by: string;
  page: string;
}

export const PHOTOS: Record<string, Photo> = {
  "pane-integrale": { src: "1549931319-a545dcf3bc73", by: "Jude Infantini", page: "selective-focus-photography-of-sliced-bread-rYOqbTcGp1c" },
  "pane-segale": { src: "1509440159596-0249088772ff", by: "Wesual Click", page: "rustic-bread-loaves-with-wheat-stalks-rsWZ-P9FbQ4" },
  "focaccia": { src: "1619452357216-e88ca8119eeb", by: "Paula Berto", page: "brown-bread-with-red-sauce-WLbD34w3kRQ" },
  "cornetti": { src: "1681218079567-35aef7c8e7e4", by: "Vicky Nguyen", page: "a-croissant-sitting-on-top-of-a-cork-coaster-a4xoMVKzbak" },
  "piadine": { src: "1655979284091-eea0e93405ee", by: "Ajeet Panesar", page: "a-plate-of-food-WrE3ruckrwI" },
  "lasagne": { src: "1709429790175-b02bb1b19207", by: "Emanuel Ekström", page: "a-white-plate-topped-with-lasagna-covered-in-sauce-flEUTTwGlJQ" },
  "pollo-arrosto": { src: "1606728035253-49e8a23146de", by: "Claudio Schwarz", page: "roasted-chicken-on-white-ceramic-plate-4qJlXK4mYzU" },
  "insalata-riso": { src: "1609355109210-82d65e943fcc", by: "Karolina Kołodziejczak", page: "white-and-blue-ceramic-bowl-with-food-ftMG-QCg7qQ" },
  "hummus": { src: "1637949385162-e416fb15b2ce", by: "Ludovic Avice", page: "a-bowl-of-hummus-with-a-garnish-on-top-yr-sW_x9aHk" },
  "polpette-lenticchie": { src: "1625242661157-e9e5708ffe5e", by: "Reshu Drolia", page: "fried-food-on-black-ceramic-plate-zPZ3n-2DwHo" },
  "tofu": { src: "1722635940350-d1b2e5129379", by: "Kamala Bright", page: "a-pile-of-tofu-cubes-sitting-on-top-of-a-cutting-board-SGSJOJcEIL8" },
  "petto-pollo": { src: "1633096013004-e2cb4023b560", by: "Philippe Zuber", page: "two-raw-chicken-breasts-in-a-black-bowl-9ZrWR8R961U" },
  "tacchino": { src: "1697862446317-9f7d37ff0d21", by: "大胡子", page: "a-white-plate-topped-with-meat-and-lettuce-m7qqkpIlDjs" },
  "macinato": { src: "1609183556292-f208be1a9644", by: "Tomoyo S", page: "brown-food-on-white-ceramic-bowl-TTuYs8aZlns" },
  "hamburger": { src: "1612078894671-f11ba41d713e", by: "Piret Ilver", page: "raw-meat-on-brown-wooden-chopping-board-92YG7We2xUU" },
  "salsiccia": { src: "1766589152317-2bafe6f2923c", by: "Diego Arenas de Rodrigo", page: "several-grilled-sausages-arranged-on-a-wooden-board-A5uJBTqz6D4" },
  "salmone": { src: "1499125562588-29fb8a56b5d5", by: "Caroline Attwood", page: "raw-fish-meat-on-brown-chopping-board-kC9KUtSiflw" },
  "orata": { src: "1621590183062-bca4b1667268", by: "henry perks", page: "fish-on-white-and-blue-floral-ceramic-plate-ThwSJkPjkW8" },
  "merluzzo": { src: "1773739685848-a46fb41ae4f0", by: "Geoffrey Moffett", page: "raw-fish-fillets-on-ice-at-a-market-stall-GIpcS2IXsdc" },
  "gamberi": { src: "1578069744397-2f3942a02a7b", by: "John Cameron", page: "pile-of-shrimps-r4QVfQtytQ4" },
  "insalata-mista": { src: "1569760142069-bc6838de16c1", by: "Jonathan Ybema", page: "plate-of-vegetable-salad-r8A-FTlLY3c" },
  "pomodori": { src: "1546094096-0df4bcaaa337", by: "Alex Ghizila", page: "three-cherry-tomatoes-UD_j10SKj5g" },
  "spinaci": { src: "1576045057995-568f588f82fb", by: "Elianna Friedman", page: "green-leafy-vegetables-4jpNPu7IW8k" },
  "zucchine": { src: "1691480291894-75229c2bfd44", by: "personalgraphic.com", page: "three-green-cucumbers-on-a-white-background-_Ef2SUNv468" },
  "mele": { src: "1619546813926-a78fa6372cd2", by: "Amit Lahav", page: "red-apple-on-white-background-rxN2MRdFJVg" },
  "banane": { src: "1640958900081-7b069dd23e9c", by: "Gabriel Mihalcea", page: "a-bunch-of-bananas-sitting-on-top-of-a-white-table-1jyRHJPkpz8" },
  "frutti-bosco": { src: "1556048029-9c5edf1aa695", by: "Timo Volz", page: "raspberry-and-blueberry-lot-pYpnKA52a-A" },
  "mozzarella": { src: "1633253037246-12bb11ff545a", by: "laura novara", page: "a-container-filled-with-white-marshmallows-sitting-on-top-of-a-counter-Z9H78pwQJMY" },
  "yogurt-greco": { src: "1571212515416-fef01fc43637", by: "micheile henderson", page: "a-bowl-of-yogurt-with-a-spoon-in-it-NFHeBysjCTI" },
  "latte-fresco": { src: "1517448931760-9bf4414148c5", by: "Kim Leary", page: "clear-drinking-glass-with-white-liquid-p3ViLmVgVJ4" },
  "ricotta": { src: "1632200729570-1043effd1b77", by: "Aleksey Melkomukov", page: "a-piece-of-cake-sitting-on-top-of-a-wooden-cutting-board-OxUaBR0ORb0" },
  "fiocchi-latte": { src: "1573810655264-8d1e50f1592d", by: "Megumi Nachev", page: "cooked-food-on-bowl-bBCRrplhhZ4" },
  "parmigiano": { src: "1729671971046-428d29acfa1f", by: "Finn Passchier", page: "a-bunch-of-cheese-stacked-on-top-of-each-other-z6o5ytLwPc4" },
  "uova": { src: "1639194335563-d56b83f0060c", by: "Raiyan Zakaria", page: "a-pile-of-eggs-sitting-next-to-each-other-jDkrpWtSkb4" },
  "pasta-integrale": { src: "1587682725980-b9ac16626266", by: "Patrick Tomasso", page: "yellow-corn-on-white-textile-FNrmJM-EVKU" },
  "avena": { src: "1598048851887-0263d4f43e73", by: "Jocelyn Morales", page: "brown-and-white-ceramic-bowl-GuJ8KO4LywI" },
  "ceci": { src: "1515543904379-3d757afe72e4", by: "Deryn Macey", page: "yellow-corn-on-glass-bowl-h83Rm3njjcg" },
  "caffe": { src: "1447933601403-0c6688de566e", by: "Mike Kenneally", page: "coffee-bean-lot-TD4DBagg2wE" },
  "acqua": { src: "1772857199147-7e0ff401665e", by: "Quang Tran", page: "a-glass-of-water-on-a-wooden-desk-p-Xc2noGZg4" },
  "biscotti": { src: "1597733153203-a54d0fbc47de", by: "Vyshnavi Bisani", page: "brown-round-cookie-on-white-surface-z8kriatLFdA" },
  "panetteria": { src: "1608198093002-ad4e005484ec", by: "mohamed hassouna", page: "brown-bread-on-brown-wicker-basket-N4gtuEZ5gWc" },
  "gastronomia": { src: "1689774504345-6cf299b0b312", by: "Thomas Park", page: "a-variety-of-food-is-laid-out-on-a-table-G3oLwnxlQUA" },
  "carne": { src: "1772285466464-8ccda2c3be92", by: "Magnus Jonasson", page: "two-raw-ribeye-steaks-seasoned-with-salt-on-a-rack-E5GBbE74cLc" },
  "pesce": { src: "1563557908-b7787229f123", by: "camila igisk", page: "a-bunch-of-fish-that-are-on-some-ice-yFU8qIDo9s4" },
  "ortofrutta": { src: "1579113800032-c38bd7635818", by: "Marisol Benitez", page: "pile-of-vegetables-QvkAQTNj4zk" },
  "latticini": { src: "1683314573422-649a3c6ad784", by: "David Foodphototasty", page: "a-couple-of-pieces-of-cheese-sitting-on-top-of-a-wooden-cutting-board-JJcT6VJWDlg" },
};

/** Image URL at a given display size (2x for sharp screens, cropped square) */
export function photoUrl(p: Photo, size: number): string {
  const px = size <= 48 ? 120 : size <= 96 ? 200 : 320;
  return `https://images.unsplash.com/photo-${p.src}?w=${px}&h=${px}&fit=crop&crop=entropy&q=70&auto=format`;
}
