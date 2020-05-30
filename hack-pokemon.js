const Lexicon = require('./convert-word')
var lexicon = new Lexicon();

const memoryjs = require('memoryjs');
const processName = "VisualBoyAdvance.exe";
let clientModule;
const offset = 0x030C41F0; //<-- 69
const processObject = memoryjs.openProcess(processName);
// console.log(processObject);
const address =  offset;
console.log(`value of 0x${address.toString(16)}: ${memoryjs.readMemory(processObject.handle, address, memoryjs.BYTE)}`);



class MemoryReader{

    hex(dec){
        if(dec < 10) return "0" + dec.toString(16)
        return dec.toString(16);
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

var mem = new MemoryReader();

class PokemonReader{

    getId(address){
        var reversedByteId = mem.getArrayHex(address, 4);
        var byteId = reversedByteId.reverse();
        console.log(byteId)
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

    decryptedRow(address,key){
        var row = mem.getArrayHex(address, 4);
        var reversedData = row.reverse();
        var encrytedData = reversedData.join().replace(/,/g, '');
        return mem.xorHex(encrytedData,key);
    }

    readPokemon(baseAddress){        
        var personalityValue = memoryjs.readMemory(processObject.handle, baseAddress, memoryjs.DWORD);
        var originalTrainerId = mem.get2ByteString(baseAddress + 0x4);
        // var nameArray = memRead.getNameArray(baseAddress + 0x8);
        var name = this.getName(baseAddress + 0x8);
        // var nameArray2 = memRead.getNameArray(baseAddress + 0x10);
        var languagea = mem.get2Byte(baseAddress + 0x12);
        // var language = memRead.get2ByteString(baseAddress + 0x12);
        var trainerName = this.getName(baseAddress+0x14)

        // var checkSum = memRead.getArray(baseAddress+0x1C, 2);
        var checkSum = mem.get2Byte(baseAddress+0x1C, 2);
        var checkSumArray = mem.getArrayHex(baseAddress+0x1C,2);
     
        console.log("Personality:", personalityValue);
        console.log("OTid:", originalTrainerId);
        console.log("Name:", name);
        console.log("Language array", languagea);
        // console.log("language", language);
        console.log("TrainerName:", trainerName);
        console.log("checksum", checkSum);
        console.log("checksum array", checkSumArray);

        console.log("Personality:", personalityValue);
        console.log("OTid:", originalTrainerId);
        console.log("sub order", personalityValue%0x18); //12 DABC
        
        var pokemonId = this.getId(baseAddress);
        var trainerId = this.getId(baseAddress + 0x4);

        var key = mem.xorHex(trainerId,pokemonId);

        // 12 DABC
        var pokemonBaseAddress = baseAddress+0x20;
        var total = 0x0;
        for(var i=0; i < 12; i ++){
            var row = mem.getArrayHex(pokemonBaseAddress+0x4*i, 4);
            var reversedData = row.reverse();
            var encrytedData = reversedData.join().replace(/,/g, '');
            var decryptedData = mem.xorHex(encrytedData,key);
            //console.log(encrytedData, decryptedData);
            console.log((pokemonBaseAddress+i*4).toString(16),decryptedData, decryptedData.substr(0,4),decryptedData.substr(4,4));
            total=mem.addHex(total, decryptedData.substr(0,4));
           // console.log(total)
           total=mem.addHex(total, decryptedData.substr(4,4));
           // console.log(total)
        }
        console.log("total",total)

        //a struct
        
        var pokemonBaseAddress = 0x30c427c;//baseAddress+0x20;
        var total = 0x0;
        var itemAndNumber = this.decryptedRow(pokemonBaseAddress, key);
        var item =  itemAndNumber.substr(0,4)
        var pokeNum = itemAndNumber.substr(4,4);
        console.log(itemAndNumber)
        //console.log(encrytedData, decryptedData);
        console.log("item",item,"num",pokeNum);
        // total=mem.addHex(total, item);
        // total=mem.addHex(total, pokeNum);
        // console.log("total",total)

    }
}


var pokeReader = new PokemonReader();
pokeReader.readPokemon(0x030C4250);

console.log("________________________")
// pokeReader.readPokemon(0x030C43E0);
//pokeReader.readPokemon(0x030C42B4);

//data.map(x => parseInt(x, 16))