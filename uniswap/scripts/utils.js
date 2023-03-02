
const fs = require('fs');


module.exports = {
  
writeAddressInFile: function (inputFilePath, key, value) {
  const outFilePath = inputFilePath; 
  var data = fs.readFileSync(inputFilePath, {encoding:'utf8', flag:'r'});

    data = strToObj(data.slice(data.indexOf('{')));
    data[key] = value;

    data = 'module.exports = ' + JSON.stringify(data);
    fs.appendFileSync(outFilePath, data, { encoding: "utf8", flag: "w" });

    function strToObj(e){ 
      var obj= new Function("return" +e); 
      return obj();
    };
}

}