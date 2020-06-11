const Lexicon = require('./convert-word')
var lexicon = new Lexicon();

const Movicon = require('./convert-move')
var move = new Movicon();

const memoryjs = require('memoryjs');
const processName = "VisualBoyAdvance.exe";
let clientModule;
const offset = 0x030C41F0; //<-- 69
const processObject = memoryjs.openProcess(processName);
// console.log(processObject);
const address =  offset;
// console.log(`value of 0x${address.toString(16)}: ${memoryjs.readMemory(processObject.handle, address, memoryjs.BYTE)}`);



class MemoryReader{

    hex(dec){
        var hex = dec.toString(16).toUpperCase();
        if(hex.length < 2) return "0" + hex;
        return hex;
    }

    get2Byte(address){
        var b1 = memoryjs.readMemory(processObject.handle, address, memoryjs.BYTE);
        var b2 = memoryjs.readMemory(processObject.handle, address+1, memoryjs.BYTE);
        var byte2 = this.hex(b2)+this.hex(b1);
        return byte2;
    }

    get2ByteString(address){
        return parseInt(this.get2Byte(address), 16);
    }

    getArray(address, length){
        var nameArray = [];
        for(var i = address; i < address + length; i++ ){
            var b = memoryjs.readMemory(processObject.handle, i, memoryjs.BYTE);
            nameArray.push(b);
        }
        return nameArray;
    }

    getArrayHex(address, length){
        var nameArray = [];
        for(var i = address; i < address + length; i++ ){
            var b = memoryjs.readMemory(processObject.handle, i, memoryjs.BYTE);
            var hexValue = this.hex(b.toString(16)).toUpperCase();

            ///???????????
            if(hexValue.length < 2) hexValue = '0' + hexValue;
            ///
            nameArray.push(hexValue);
        }
        // console.log("hex array:", nameArray)
        return nameArray;
    }

    addHex(a, b) {
        // console.log("adding:",a,b)
        var decA = parseInt(a,16)
        var decB = parseInt(b,16)
        var c = decA + decB;
        // console.log(decA, decB, c);
        return c.toString(16);
    }

    xorHex(a, b) {
        var res = "",
            i = a.length,
            j = b.length;
        while (i-->0 && j-->0)
            res = (parseInt(a.charAt(i), 16) ^ parseInt(b.charAt(j), 16)).toString(16) + res;
        return res;
    }
}

var order = {
    0x0 : 'ABCD',
    0x1 : 'ABDC',
    0x2 : 'ACBD',
    0x3 : 'ACDB',
    0x4 : 'ADBC',
    0x5 : 'ADCB',
    0x6 : 'BACD',
    0x7 : 'BADC',
    0x8 : 'BCAD',
    0x9 : 'BCDA',
    0xA : 'BDAC',
    0xB : 'BDCA',
    0xC : 'CABD',
    0xD : 'CADB',
    0xE : 'CBAD',
    0xF : 'CBDA',
    0x10 : 'CDAB',
    0x11 : 'CDBA',
    0x12 : 'DABC',
    0x13 : 'DACB',
    0x14 : 'DBAC',
    0x15 : 'DBCA',
    0x16 : 'DCAB',
    0x17 : 'DCBA'
};

var mem = new MemoryReader();

let pokemon = {

};

class PokemonReader{

    getId(address){
        var reversedByteId = mem.getArrayHex(address, 4);
        var byteId = reversedByteId.reverse();
        // console.log(byteId)
        return byteId.join().replace(/,/g, '');
    }

    getName(address){
        var nameArray = [];
        for(var i = address; i < address + 10; i++ ){
            //console.log("a:",i)
            var b = memoryjs.readMemory(processObject.handle, i, memoryjs.BYTE);
            var hex = b.toString(16).toUpperCase();
            if(hex == "FF")break;
            nameArray.push(lexicon.convertLetter( hex ));
        }
        return nameArray.toString().replace(/,/g, '');
    }

    setName(address, name){
        var limit = Math.min(name.length,10);
        console.log(limit)
        for(var i = 0; i < limit; i++ ){
            var letter = name[i];
            var letterAsByte = lexicon.getByteValue(letter);
            console.log(letterAsByte)
            // var b = memoryjs.writeMemory(processObject.handle, letterAsByte, address + i, memoryjs.BYTE);
            // var hex = b.toString(16).toUpperCase();
            // if(hex == "FF")break;
            // nameArray.push(lexicon.convertLetter( hex ));
        }
        // return nameArray.toString().replace(/,/g, '');
    }

    getNameHex(address){
        var nameArray = [];
        for(var i = address; i < address + 10; i++ ){
            //console.log("a:",i)
            var b = memoryjs.readMemory(processObject.handle, i, memoryjs.BYTE);
            var hex = b.toString(16).toUpperCase();
            if(hex == "FF")break;
            nameArray.push( hex );
        }
        return nameArray.toString().replace(/,/g, ' ');
    }

    decryptedRow(address,key){
        var row = mem.getArrayHex(address, 4);
        var reversedData = row.reverse();
        var encrytedData = reversedData.join().replace(/,/g, '');
        return mem.xorHex(encrytedData,key);
    }

    splitRow(rowHex){
        var  rowDec = parseInt(rowHex,16);
        var decValue = [];
        decValue[0] = rowDec % 256; 
        decValue[1] = rowDec/256 % 256 >> 0;
        decValue[2] = rowDec/65536 % 256 >> 0;
        decValue[3] = rowDec/16777216 % 256 >> 0;
        return decValue;
    }

    getOrder(hex){
        return order[hex];
    }

    decodeA(baseAddress,offset,key){
        console.log(baseAddress, baseAddress+0x44, parseInt(baseAddress+44,16))
        var pokemonStatsAddress = baseAddress+offset;//44; // 0x30c427c; //ivysaur
        var itemAndNumber = this.decryptedRow(pokemonStatsAddress, key);
        var item =  itemAndNumber.substr(0,4)
        var pokeNum = itemAndNumber.substr(4,4);
        var exp = this.decryptedRow(pokemonStatsAddress+4, key);
        var ppvalues = this.decryptedRow(pokemonStatsAddress+8, key);
        var happyness = parseInt(ppvalues.substr(4,2),16);
        var move1pp =  parseInt(ppvalues,16)%4;
        var move2pp =  parseInt(ppvalues,16)/4%4;
        var move3pp =  parseInt(ppvalues,16)/16%4;
        var move4pp =  parseInt(ppvalues,16)/64%4;
        
        console.log("Hold item",item);
        console.log("Game number",pokeNum);
        console.log("exp",parseInt(exp,16));
        console.log("happyness",happyness);
        console.log("pp used 1:",move1pp);
        console.log("pp used 2:",move2pp);
        console.log("pp used 3:",move3pp);
        console.log("pp used 4:",move4pp);
    }

    decodeB(baseAddress,offset,key){
        
        //b struct
        var pokemonMovesAddress = baseAddress+offset;
        var moveonetwo = this.decryptedRow(pokemonMovesAddress, key);
        var move2 = moveonetwo.substr(0,4);
        var move1 = moveonetwo.substr(4,4);
        var move34 = this.decryptedRow(pokemonMovesAddress + 4, key);
        var move4 = move34.substr(0,4);
        var move3 = move34.substr(4,4);
        var movesPP = this.decryptedRow(pokemonMovesAddress+8, key);
        // var ppMask = parseInt(movesPP,16);
        var pp = this.splitRow(movesPP);

        console.log("Move 1:", move.fromHex(move1,16), pp[0]); //get last 2 bits which are in int form
        console.log("Move 2:", move.fromHex(move2,16), pp[1]); //100 hex get next 2 bits /shifts bits -> % removes bits to the <-
        console.log("Move 3:", move.fromHex(move3,16), pp[2]); //65536 == 10000 hex
        console.log("Move 4:", move.fromHex(move4,16), pp[3]); //1 00 00 00   >> 0 bit shift to remove decimal
    }

    decodeC(baseAddress,offset,key){
        console.log("C")
        var pokemonMovesAddress = baseAddress+offset;
        var pokemonEffortAddress = pokemonMovesAddress + 12;
        var efforts = this.splitRow(this.decryptedRow(pokemonEffortAddress, key));
        console.log("efforts","HP", efforts[0], "Attack", efforts[1], "defence", efforts[2], "speed", efforts[3]);

        var c2 = this.splitRow(this.decryptedRow(pokemonEffortAddress+4,key));
        console.log('specialAttackEffort',c2[0], " special defence Effort", c2[1], "cool", c2[2], "beauty", c2[3]);

        var c3 = this.splitRow(this.decryptedRow(pokemonEffortAddress+8,key));
        console.log("luster",c3[0], "tough", c3[1], "smart", c3[2], "cute", c3[3]);
    }

    decodeD(baseAddress,offset,key){
        console.log("D")
        var metaDataAddresss = baseAddress+offset;
        
        var d0 = this.decryptedRow(metaDataAddresss, key);
        var d1 = this.decryptedRow(metaDataAddresss + 4, key);
        var d2 = this.decryptedRow(metaDataAddresss + 8, key);

        console.log(d0,d1,d2)
        console.log(mem.getArrayHex(metaDataAddresss, 10))
        var d = this.splitRow(d0);
        var pokerus = d[0];
        var locationCaught = d[1];
        var levelMet = d[2]// & 127;
        var gameFrom = parseInt(d0,16) / 0x800000 % 0x10 >> 0;  //2 ruby

        console.log('pokerus', pokerus);
        console.log('location met', locationCaught);
        console.log('level met', levelMet);
        console.log('Game From', gameFrom);

        var ballCaughtWith = parseInt(d0,16) / 0x8000000 % 0x10 >> 0;  
        console.log("caught with ball type", ballCaughtWith);
        var OTgender = parseInt(d0,16) / 0x80000000 % 0x10 >> 0;
        console.log("OT gender", OTgender = 0 ? "boy": "girl"); // 0 boy 1 girl

        // var DVs  range 0 to 31
        var HPDV  = ('0x'+d1) % 0x20 >> 0;
        var AtkDV = ('0x'+d1) / 0x20 % 0x20 >> 0;
        var DefDV = ('0x'+d1) / 0x400 % 0x20 >> 0;
        var SpeDV = ('0x'+d1) / 0x8000 % 0x20 >> 0;
        var SpADV = ('0x'+d1) / 0x100000 % 0x20 >> 0;
        var SpDDV = ('0x'+d1) / 0x2000000 % 0x20 >> 0;

        console.log("HPDV",HPDV,"AtkDV",AtkDV,"DefDV",DefDV,"SpeDV",SpeDV,"SpADV",SpADV,"SpDDV",SpDDV);

        var eggFlag = ('0x'+d1) / 0x40000000 % 0x2 >> 0;
        console.log("Egg", eggFlag == 0 ? "No": "Yes"); 
        
        console.log(d1);
        var abilityUsed = ('0x'+d1)/0x80000000%0x2;
        console.log("ability used", abilityUsed);

        // var Ribbons

        var obedient = parseInt(d2,16/2147483648)%2>>0;
        console.log(d2);
        console.log(obedient);
    }

    writePokemon(baseAddress, pokemon){
        
    }

    readPokemon(baseAddress){        
        var personalityValue = memoryjs.readMemory(processObject.handle, baseAddress, memoryjs.DWORD);
        var originalTrainerId = mem.get2ByteString(baseAddress + 0x4);
        var name = this.getName(baseAddress + 0x8);
        var nameHex = this.getNameHex(baseAddress + 0x8);
        var languagea = mem.get2Byte(baseAddress + 0x12);
        var trainerName = this.getName(baseAddress+0x14)

        var checkSum = mem.get2Byte(baseAddress+0x1C, 2);
   
        // console.log("Personality:", personalityValue);
        // console.log("OTid:", originalTrainerId);
        console.log("Namehex", nameHex);
        console.log("Name:", name);
        // console.log("Language array", languagea);
        // console.log("TrainerName:", trainerName);
        // console.log("checksum", checkSum);

        // console.log("Personality:", personalityValue);
        // console.log("OTid:", originalTrainerId);

        // var orderVal = personalityValue%0x18;
        // console.log("ORDER VAL",orderVal.toString(16),orderVal, personalityValue , "%", 0x18)
        // var order = this.getOrder( orderVal );
        // console.log("!!!!!!!!!!!!!",this.getOrder(0xFF47E89D % 0x18));//CADB test
        // console.log("sub order", order); //12 DABC
        


        // var pokemonId = this.getId(baseAddress);
        // var trainerId = this.getId(baseAddress + 0x4);

        // var key = mem.xorHex(trainerId,pokemonId);

        // // 12 DABC
        // var pokemonStatsAddress = baseAddress+32;//+0x20;
        // var total = 0x0;
        // var originalData = [];
        // for(var i=0; i < 12; i ++){
        //     var row = mem.getArrayHex(pokemonStatsAddress+0x4*i, 4);
        //     originalData.push(row);
        //     var reversedData = row.reverse();
        //     var encrytedData = reversedData.join().replace(/,/g, '');
        //     var decryptedData = mem.xorHex(encrytedData,key);
        //     // console.log(decryptedData)
        //     total=mem.addHex(total, decryptedData.substr(0,4));
        //     total=mem.addHex(total, decryptedData.substr(4,4));
        // }
        // console.log("total",total, "should contain", checkSum);

        // var offset = 32;
        // [...order].forEach(letter => {
        //     if(letter == "A"){
        //         this.decodeA(baseAddress,offset,key)
        //     }
        //     else if(letter == "B"){
        //         this.decodeB(baseAddress,offset,key)
        //     }
        //     else if(letter == "C"){
        //         this.decodeC(baseAddress,offset,key)
        //     }
        //     else if(letter == "D"){
        //         this.decodeD(baseAddress,offset,key)
        //     }
        //     offset += 12;
        // });


        // console.log(originalData);


       


    }

    changeSnorlaxInSlot2(addressOfFirstPokemon)
    {   
        console.log("hi")
        var addressOfThirdPokemon = addressOfFirstPokemon + 100;
        var baseAddress = addressOfThirdPokemon;
        var personalityValue = 0;
        //memoryjs.writeMemory(processObject.handle, baseAddress,personalityValue,memoryjs.DWORD);
        var originalTrainerId = mem.get2ByteString(baseAddress + 0x4);
        
        this.setName(baseAddress + 0x8, "Snorlax")

        // var name = this.getName(baseAddress + 0x8);
        // var nameHex = this.getNameHex(baseAddress + 0x8);
        // var languagea = mem.get2Byte(baseAddress + 0x12);
        // var trainerName = this.getName(baseAddress+0x14)

        // var checkSum = mem.get2Byte(baseAddress+0x1C, 2);
   
        // // console.log("Personality:", personalityValue);
        // // console.log("OTid:", originalTrainerId);
        // console.log("Namehex", nameHex);
        // console.log("Name:", name);
        // console.log("Language array", languagea);
        // console.log("TrainerName:", trainerName);
        // console.log("checksum", checkSum);

        // console.log("Personality:", personalityValue);
        // console.log("OTid:", originalTrainerId);

        // var orderVal = personalityValue%0x18;
        // console.log("ORDER VAL",orderVal.toString(16),orderVal, personalityValue , "%", 0x18)
        // var order = this.getOrder( orderVal );
        // console.log("!!!!!!!!!!!!!",this.getOrder(0xFF47E89D % 0x18));//CADB test
        // console.log("sub order", order); //12 DABC
        


        // var pokemonId = this.getId(baseAddress);
        // var trainerId = this.getId(baseAddress + 0x4);

        // var key = mem.xorHex(trainerId,pokemonId);

        // // 12 DABC
        // var pokemonStatsAddress = baseAddress+32;//+0x20;
        // var total = 0x0;
        // var originalData = [];
        // for(var i=0; i < 12; i ++){
        //     var row = mem.getArrayHex(pokemonStatsAddress+0x4*i, 4);
        //     originalData.push(row);
        //     var reversedData = row.reverse();
        //     var encrytedData = reversedData.join().replace(/,/g, '');
        //     var decryptedData = mem.xorHex(encrytedData,key);
        //     // console.log(decryptedData)
        //     total=mem.addHex(total, decryptedData.substr(0,4));
        //     total=mem.addHex(total, decryptedData.substr(4,4));
        // }
        // console.log("total",total, "should contain", checkSum);

        // var offset = 32;
        // [...order].forEach(letter => {
        //     if(letter == "A"){
        //         this.decodeA(baseAddress,offset,key)
        //     }
        //     else if(letter == "B"){
        //         this.decodeB(baseAddress,offset,key)
        //     }
        //     else if(letter == "C"){
        //         this.decodeC(baseAddress,offset,key)
        //     }
        //     else if(letter == "D"){
        //         this.decodeD(baseAddress,offset,key)
        //     }
        //     offset += 12;
        // });


        // console.log(originalData);


       


    }
}


var pokeReader = new PokemonReader();
//pokeReader.readPokemon(0x030C4250);

// console.log("________________________")
// pokeReader.readPokemon(0x030C43E0);
//pokeReader.readPokemon(0x030C42B4);

//data.map(x => parseInt(x, 16))

var candyAddressOffset = 0x32F9F0;
var candyBaseAddress = candyAddressOffset+processObject.modBaseAddr;//0x72F9F0; //not sure where this came from, it is the base in the pointer thing in cheat engine
// console.log(candyBaseAddress.toString(16))
var startAddress = memoryjs.readMemory(processObject.handle, candyBaseAddress, memoryjs.DWORD);

var rareCandyOffset = 0x25C9A;
var rareCandyAmount = memoryjs.readMemory(processObject.handle, startAddress + rareCandyOffset, memoryjs.BYTE);

// console.log("Rare candy ammount:", rareCandyAmount, "should be 98");


var slot1Offset = 0x32F9F8;
var slot1BaseAddress = slot1Offset + processObject.modBaseAddr;
// console.log(slot1BaseAddress);
// console.log(slot1BaseAddress.toString(16));
var pokemonStartAddress = memoryjs.readMemory(processObject.handle, slot1BaseAddress, memoryjs.DWORD);


var offset2 = 0x4360;
var pokemonFirstValue = memoryjs.readMemory(processObject.handle, pokemonStartAddress + offset2, memoryjs.BYTE);

// console.log(pokemonFirstValue);
//428e3b
//28E50
// console.log((pokemonStartAddress + offset2 + 100).toString(16))
// pokeReader.readPokemon( 0x030F821C);

pokeReader.readPokemon( pokemonStartAddress + offset2);
pokeReader.changeSnorlaxInSlot2(pokemonStartAddress + offset2);
// console.log("\n\n\n")
// pokeReader.readPokemon( pokemonStartAddress + offset2 + 100);
// pokeReader.readPokemon( pokemonStartAddress + offset2 + 200);
// pokeReader.readPokemon( pokemonStartAddress + offset2 + 300);
// pokeReader.readPokemon( pokemonStartAddress + offset2 + 400);


// var encodedStrings = "00 00 FF 05 00 00 C8 E3 00 E7 E4 D9 D7 DD D5 E0 00 D5 D6 DD E0 DD E8 ED AD FF C2 D9 E0 E4 E7 00 E6 D9 E4 D9 E0 00 EB DD E0 D8 00 CA C9 C5 1B C7 C9 C8 AD FF CD E9 E1 E1 E3 E2 E7 00 E6 D5 DD E2 00 DD E2 00 D6 D5 E8 E8 E0 D9 AD FF C1 E6 D5 D8 E9 D5 E0";
// var encodedArray = encodedStrings.split(' ');

// var decodedString = encodedArray.map(byte => byte + " " + lexicon.convertLetter( byte ));

// console.log(decodedString);