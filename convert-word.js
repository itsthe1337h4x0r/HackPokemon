
  var  map = {
    '00':' ',
    '1B': 'é',
    'BB': 'A',
    'BC': 'B',
    'BD': 'C',
    'BE': 'D',
    'BF': 'E',
    'C0': 'F',
    'C1': 'G',
    'C2': 'H',
    'C3': 'I',
    'C4': 'J',
    'C5': 'K',
    'C6': 'L',
    'C7': 'M',
    'C8': 'N',
    'C9': 'O',
    'CA': 'P',
    'CB': 'Q',
    'CC': 'R',
    'CD': 'S',
    'CE': 'T',
    'CF': 'U',
    'D0': 'V',
    'D1': 'W',
    'D2': 'X',
    'D3': 'Y',
    'D4': 'Z',
    'D5': 'a',
    'D6': 'b',
    'D7': 'c',
    'D8': 'd',
    'D9': 'e',
    'DA': 'f',
    'DB': 'g',
    'DC': 'h',
    'DD': 'i',
    'DE': 'j',
    'DF': 'k',
    'E0': 'l',
    'E1': 'm',
    'E2': 'n',
    'E3': 'o',
    'E4': 'p',
    'E5': 'q',
    'E6': 'r',
    'E7': 's',
    'E8': 't',
    'E9': 'u',
    'EA': 'v',
    'EB': 'w',
    'EC': 'x',
    'ED': 'y',
    'EE': 'z',
    'A1': '0',
    'A2': '1',
    'A3': '2',
    'A4': '3',
    'A5': '4',
    'A6': '5',
    'A7': '6',
    'A8': '7',
    'A9': '8',
    'AA': '9',
    'AB': '!',
    'AC': '?',
    'AD': '.',
    'AE': '-',
    'AF': '.',// center
    'B0': '.',//.
    'B1': '"',// start Quote
    'B2': '"',// end Quote
    'B3': '\'',// star single Quote
    'B4': '\'',// end single Quote
    'B5': 'M',//Male
    'B6': 'F',//Female
    'B7': 'P',//Pokemon Money
    'B8': ',',//
    'B9': 'x',// multiply
    'BA': '/'
    };

    var reverseMap = {};
    Object.entries(map).map((key) => {reverseMap[key[1]] = key[0]});
    // console.log(reverseMap)

class ConvertWord{

    convertLetter(hex){
        return map[hex];
    }

    getByteValue(letter){
        return reverseMap[letter];
    }

}

module.exports = ConvertWord
