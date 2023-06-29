const fs = require('fs');
const readline = require('readline');
const path = require('path');


// directories to loop over
const directories = ['./dev1/emea/server/pe-importer', './dev1/na/server/pe-importer', './prod/emea/server/pe-importer', "./prod/na/server/pe-importer", "./uat1/emea/server/pe-importer", "./uat1/na/server/pe-importer"];
let currentPath = process.cwd();
let common_Prod_Properties="common.prod.properties";
let common_Non_Prod_Properties="common.prod.properties";
let na_uat1_Properties="na.uat1.properties"
let emea_uat1_Properties="emea.uat1.properties"
let apac_uat1_Properties="apac.uat1.properties"

let na_dev1_Properties="na.dev1.properties"
let emea_dev1_Properties="emea.dev1.properties"
let apac_dev1_Properties="apac.dev1.properties"

let na_prod_Properties="na.prod.properties"
let emea_prod_Properties="emea.prod.properties"
let apac_prod_Properties="apac.prod.properties"




let duplicateLine = new Map();

const processFile = (filePath) => {

  fs.readFile(filePath, "utf-8", (err, data)=>{
      if(err){
        console.log(err);
      }else{
        try {
          if(data.includes(". ") || data.includes("= ")){
            console.log(`${data }, missing value at ${filePath} `)
          }
          fs.writeFileSync(`${currentPath}/${common_Non_Prod_Properties}`, data)
        } catch (error) {
          console.log(error);
        }
      }
    })


};

const processDirectory = async (dir) => {
  const files = fs.readdirSync(dir);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const extension = path.extname(file);
    if (extension === '.csv' || extension === '.properties') {
      await processFile(path.join(dir, file));
      
      
      
    }
  }
};

(async () => {
  for (let i = 0; i < directories.length; i++) {
    await processDirectory(directories[i]);
  }

  let duplicates = [...duplicateLine.entries()].filter(([line, count]) => count > 1).map(([line, count]) => line);
  let duplicateLines = duplicates.map(line => {
    for (let [lineline, line] of duplicateLine.entries()) {
      if (lineline === line) {
        console.log("line: "+ line )
        return line;
      }
    }
  });

  fs.writeFile(`${currentPath}/${common_Prod_Properties}`, duplicateLines.join('\n'), (err) => {
    if (err) throw err;
  });
})();
