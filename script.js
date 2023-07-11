https://github.com/jonasschmedtmann/ultimate-react-course ==> react

https://github.com/echarlot1/complete-javascript-course ==> javascript 










const fs = require('fs');
const readline = require('readline');
const path = require('path');


let currentPath = process.cwd();
let common_Prod_Properties="common.prod.properties";
let common_Non_Prod_Properties="common.non-prod.properties";

// Directories to check
const directories = ['./dev1/apac/server/pe-importer',"./dev1/emea/server/pe-importer", './dev1/na/server/pe-importer',"./prod/apac/server/pe-importer", './prod/emea/server/pe-importer', "./prod/na/server/pe-importer", "./uat1/apac/server/pe-importer", "./uat1/emea/server/pe-importer", "./uat1/na/server/pe-importer"];

// const directories =['./dev1/apac/server/pe-importer',"./dev1/emea/server/pe-importer", './dev1/na/server/pe-importer']



// Object to store lines read from each directory
let linesByDirectory = {};

directories.forEach((dir) => {
    // Get file names in directory
    const files = fs.readdirSync(dir);

    // Process each file
    files.forEach((file) => {
        const filePath = path.join(dir, file);

        const rl = readline.createInterface({
            input: fs.createReadStream(filePath),
            output: process.stdout,
            terminal: false
        });

        // Read file line by line
        rl.on('line', (line) => {
            // Ignore empty lines
            if (line) {
                if (!linesByDirectory[dir]) {
                    linesByDirectory[dir] = {};
                }
                linesByDirectory[dir][line] = true;
            }
        });

        // After reading all lines
        rl.on('close', () => {
            // Check if all directories have been read
            if (Object.keys(linesByDirectory).length === directories.length) {
                let commonLines = Object.keys(linesByDirectory[dir]);
                // Get common lines across all directories
                for (let directory of directories) {
                    commonLines = commonLines.filter((line) => linesByDirectory[directory][line]);
                }

                // Write common lines to common.properties
                fs.writeFileSync(`${currentPath}/${common_Prod_Properties}`, commonLines.join('\n'));
                fs.writeFileSync(`${currentPath}/${common_Non_Prod_Properties}`, commonLines.join('\n'));
                
                // If lines are different, write them to specific file
                for (let directory of directories) {
                  // console.log(directory)
                  let parts = directory.split('/');
                  let word = parts[2]
                  let regionWord=parts[1]
                    let uniqueLines = Object.keys(linesByDirectory[directory])
                        .filter((line) => !commonLines.includes(line));
                    fs.writeFileSync(`${word}-${regionWord}.properties`, uniqueLines.join('\n'));
                }
            }
        });
    });
});













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









const fs = require('fs');
const readline = require('readline');
const path = require('path');

const dirs = ['dir1', 'dir2', 'dir3'];
let lineMaps = dirs.map(() => new Map());
let fileReadCount = 0;

dirs.forEach((dir, i) => {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${dir}: ${err}`);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const lineReader = readline.createInterface({
        input: fs.createReadStream(filePath),
        crlfDelay: Infinity,
      });

      lineReader.on('line', (line) => {
        const lineCount = lineMaps[i].get(line) || 0;
        lineMaps[i].set(line, lineCount + 1);
      });

      lineReader.on('close', () => {
        fileReadCount += 1;

        // When all files have been read
        if (fileReadCount === dirs.length * files.length) {
          const commonLines = new Set();
          const uniqueLines = new Set();

          // Find lines common to all files and unique to some
          for (const [line, count] of lineMaps[0]) {
            if (lineMaps[1].has(line) && lineMaps[2].has(line)) {
              commonLines.add(line);
            } else if (lineMaps[1].has(line) || lineMaps[2].has(line)) {
              uniqueLines.add(line);
            } else {
              console.log(`Line "${line}" missing in files of directories: ${dirs.slice(1).join(', ')}`);
            }
          }

          // Print missing lines from dir2 and dir3
          for (const [line, count] of lineMaps[1]) {
            if (!lineMaps[0].has(line)) {
              console.log(`Line "${line}" missing in files of directory: ${dirs[0]}`);
            }
          }
          for (const [line, count] of lineMaps[2]) {
            if (!lineMaps[0].has(line)) {
              console.log(`Line "${line}" missing in files of directory: ${dirs[0]}`);
            }
          }

          // Write common lines to file
          fs.writeFileSync('common.properties', [...commonLines].join('\n'));

          // Write unique lines to separate files
          fs.writeFileSync('unique_dir1_dir2.properties', [...uniqueLines].join('\n'));
          fs.writeFileSync('unique_dir1_dir3.properties', [...uniqueLines].join('\n'));
        }
      });
    });
  });
});
















//========================

const fs = require('fs');
const path = require('path');

function processDirectory(directoryPath) {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error(`Error reading directory: ${directoryPath}`, err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(directoryPath, file);

      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error getting file stats: ${filePath}`, err);
          return;
        }

        if (stats.isDirectory()) {
          processDirectory(filePath);
        } else {
          processFile(filePath);
        }
      });
    });
  });
}

function processFile(filePath) {
  const fileExtension = path.extname(filePath).toLowerCase();

  if (fileExtension === '.txt') {
    fs.readFile(filePath, 'utf-8', (err, fileContent) => {
      if (err) {
        console.error(`Error reading file: ${filePath}`, err);
        return;
      }

      const lines = fileContent.trim().split('\n');
      const duplicateLines = findDuplicateLines(lines);

      if (duplicateLines.length > 0) {
        duplicateLines.forEach((line) => {
          fs.appendFileSync('duplicate_lines.txt', line + '\n', 'utf-8');
        });

        console.log(`Duplicate lines copied to file: duplicate_lines.txt`);
      }
    });
  }
}

function findDuplicateLines(lines) {
  const seen = {};
  const duplicates = [];

  for (const line of lines) {
    if (!seen[line]) {
      seen[line] = true;
    } else if (!duplicates.includes(line)) {
      duplicates.push(line);
    }
  }

  return duplicates;
}

// Provide the root directory path here
const rootDirectory = '/path/to/root/directory';
const duplicateLinesFile = 'duplicate_lines.txt';

// Delete the duplicate lines file if it already exists
if (fs.existsSync(duplicateLinesFile)) {
  fs.unlinkSync(duplicateLinesFile);
}

processDirectory(rootDirectory);

