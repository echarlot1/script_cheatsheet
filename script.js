=============================
   import { EmptyState } from "./../EmptyState";
const sampleData = require(".sampledata");

const getOverlayComponent = (
  noRowOverlayText,
  overlayType = "default",
  additionalProps = {}
) => {
  const commonProps = {
    show: true,
  };

  const propMaps = {
    search: {
      iconSize: "md",
      text: `No result found for \`${additionalProps.quickSearchText}\``,
      subText: `Try modifying your filter result in ${additionalProps.columnName}`,
    },
    filters: {
      iconSize: "md",
      text: `No result found for \`${additionalProps.quickSearchText}\``,
      subText: `Try modifying your filter result in ${additionalProps.columnName}`,
    },
    default: {
      iconSize: "md",
      text: `No result found for \`${additionalProps.quickSearchText}\``,
      subText: `Try modifying your filter result in ${additionalProps.columnName}`,
    },
  };

  return { ...commonProps, ...propMaps[overlayType] };
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.onGridReady = this.onGridReady.bind(this);
    this.onModelUpdated = this.onModelUpdated.bind(this);
    this.customRowsOverlayComponent = this.customRowsOverlayComponent.bind(this);

    this.state = {
      columnDefs: [
        {
          field: "id",
          width: 100,
          filter: false,
          suppressMenu: true,
          suppressFilterToolPanel: true,
          suppressFilterColumnPanel: true,
          hide: true,
        },
        {
          field: "first_name",
          headerName: "First Name",
        },
        {
          field: "last_name",
          headerName: "Last Name",
        },
        {
          field: "email",
          headerName: "Email",
        },
        {
          field: "balance",
          headerName: "Balance",
        },
        {
          field: "country",
          headerName: "Country",
        },
      ],
      rowData: sampleData.slice(0, 5),
      defaultColumnDef: {
        enableRowGroup: true,
      },
      sideBar: {
        toolPanels: [
          {
            id: "id",
            toolPanelParams: {
              suppressRowGroup: false,
            },
          },
        ],
      },
      nonRowsOverlayType: "default",
      columnName: "", // Initialize with an empty string
    };
  }

  customRowsOverlayComponent({ noRowOverlayText }) {
    return (
      <EmptyState
        {...getOverlayComponent(noRowOverlayText, this.state.nonRowOverlayType, {
          quickSearchText: this.api.getModel(filterManager.quickFilter),
          columnName: this.state.columnName, // Pass the column name
        })}
      />
    );
  }

  onModelUpdated({ api }) {
    console.log(api);
    if (api.getDisplayedRowCount() === 0) {
      const quickSearchUsed = api.isQuickFilterPresent();
      const filterSet = (api.filterManager.alColumnFilters || {}).size;

      if (quickSearchUsed) {
        this.setState({ nonRowsOverlayType: "search" });
      } else if (filterSet) {
        this.setState({ nonRowsOverlayType: "filters" });
      } else {
        this.setState({ nonRowsOverlayType: "default" });
      }

      const column = api.getFocusedCell().column; // Get the focused column
      if (column) {
        this.setState({ columnName: column.getColDef().headerName }); // Set the column name
      }

      api.showNoRowsOverlay();
    } else {
      api.hideOverlay();
    }
  }

  render() {
    const { columnDefs, rowData, defaultColumnDef, sideBar } = this.state;
    return (
      <>
        <ConnectGrid
          style={{ height: 300 }}
          columnDefs={columnDefs}
          rowData={rowData}
          autoFillColumn={true}
          defaultColDef={defaultColumnDef}
          sideBar={sideBar}
          noRowsOverlayComponent={this.customRowsOverlayComponent} // Fix the prop name
          onGridReady={this.onGridReady}
          onModelUpdated={this.onModelUpdated}
        />
      </>
    );
  }

  onGridReady({ api }) {
    this.api = api;
  }
}

<App />;













====================================

To pull data from a Swagger API using a sealed ID in React and TypeScript, and display it in the `ConnectGrid` component, you can follow these steps:

1. Install the necessary dependencies:
   - `axios`: A popular HTTP client library for making API requests.

   Run the following command to install the dependency:
   ```
   npm install axios
   ```

2. Create a new component called `DataFetcher.tsx` to fetch the data based on the sealed ID:

   ```tsx
   import React, { useEffect, useState } from 'react';
   import axios from 'axios';

   interface Data {
     name: string;
     appManager: string;
     version: string;
     weaveFunction: string;
   }

   interface DataFetcherProps {
     sealedId: string;
     onDataFetched: (data: Data) => void;
   }

   const DataFetcher: React.FC<DataFetcherProps> = ({ sealedId, onDataFetched }) => {
     useEffect(() => {
       const fetchData = async () => {
         try {
           const response = await axios.get<Data>(`/api/details/${sealedId}`);
           onDataFetched(response.data);
         } catch (error) {
           console.error(error);
         }
       };

       fetchData();
     }, [sealedId, onDataFetched]);

     return null;
   };

   export default DataFetcher;
   ```

   In the above example, we define the `Data` interface to represent the shape of the fetched data. We also define the `DataFetcherProps` interface to specify the props for the `DataFetcher` component. The `DataFetcher` component uses the `useEffect` hook to fetch the data from the API based on the sealed ID passed as a prop. We make an HTTP GET request using `axios` to the `/api/details/:id` endpoint, where `:id` is the sealed ID passed from the prop. Once the data is fetched, we call the `onDataFetched` callback function passed as a prop and pass the fetched data to it.

3. Update the API endpoint:
   Replace `/api/details/:id` with the actual Swagger API endpoint that provides the details based on the sealed ID. Make sure to replace it with the correct URL and endpoint path.

4. Update the `ConnectGrid.tsx` component to use the fetched data:

   ```tsx
   import React, { useState } from 'react';
   import DataFetcher from './DataFetcher';

   const ConnectGrid: React.FC = () => {
     const [data, setData] = useState<Data | null>(null);

     const onDataFetched = (fetchedData: Data) => {
       setData(fetchedData);
     };

     return (
       <div>
         <DataFetcher sealedId="your-sealed-id" onDataFetched={onDataFetched} />
         {data && (
           <Grid
             // ... other props
             rowData={[data]}
           />
         )}
       </div>
     );
   };

   export default ConnectGrid;
   ```

   In the above example, we import the `DataFetcher` component and use it in the `ConnectGrid` component. We pass the sealed ID as a prop to the `DataFetcher` component and provide the `onDataFetched` callback function to receive the fetched data. Once the data is fetched and received in the `onDataFetched` callback, we store it in the `data` state variable. Finally, we render the `Grid` component and pass the fetched data as the `rowData` prop.

5. Update the `Grid` component:
   Make sure to update the `Grid` component with the correct configuration and column definitions to display the fetched data properly.

That's it! Now, when the `ConnectGrid` component is rendered, it will fetch the data based on the sealed ID using the `DataFetcher` component. Once the data is fetched, it will be stored in the `data` state variable and passed to the `Grid` component to display it.









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

processDirectory(rootDirectory);    DONE







const fs = require('fs');
const readline = require('readline');
const path = require('path');

const directories = ['/path/to/dir1', '/path/to/dir2', '/path/to/dir3']; // replace with your directory paths

// A Set for the lines that are common to all files
let commonLines = new Set();

// For each directory, we will create a set of lines
let dirLines = [];

// A promise that resolves when a file has been read
function processFile(filepath) {
  return new Promise((resolve, reject) => {
    const lines = new Set();
    const rl = readline.createInterface({
      input: fs.createReadStream(filepath),
      output: process.stdout,
      terminal: false
    });

    rl.on('line', line => {
      // Ignore comments
      if (!line.startsWith('#')) {
        lines.add(line);
      }
    });

    rl.on('close', () => {
      resolve(lines);
    });

    rl.on('error', err => {
      reject(err);
    });
  });
}

// Read all files line by line, ignore comment lines
directories.forEach((dir, i) => {
  dirLines[i] = new Set();
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`Error reading directory: ${err}`);
      return;
    }
    files.forEach(file => {
      processFile(path.join(dir, file)).then(lines => {
        lines.forEach(line => dirLines[i].add(line));
      });
    });
  });
});

// Wait for all files to be read, then determine common and unique lines
Promise.all(dirLines.map(lines => processFile(lines))).then(() => {
  // Initialize commonLines with the lines from the first directory
  commonLines = new Set(dirLines[0]);

  // For each of the other directories, remove any line from commonLines that isn't in that directory
  for (let i = 1; i < dirLines.length; i++) {
    commonLines.forEach(line => {
      if (!dirLines[i].has(line)) {
        commonLines.delete(line);
      }
    });
  }

  // Write the common lines to common.properties
  fs.writeFile('common.properties', Array.from(commonLines).join('\n'), err => {
    if (err) {
      console.error(`Error writing to file: ${err}`);
    }
  });

  // For each directory, write the unique lines to a file named after the directory
  dirLines.forEach((lines, i) => {
    const uniqueLines = Array.from(lines).filter(line => !commonLines.has(line));
    fs.writeFile(`dir${i + 1}.txt`, uniqueLines.join('\n'), err => {
      if (err) {
        console.error(`Error writing to file: ${err}`);
      }
    });
  });
}).catch(err => {
  console.error(`Error processing files: ${err}`);
});





const fs = require('fs').promises;
const readline = require('readline');
const path = require('path');

const directories = ['dir1', 'dir2', 'dir3']; // replace with your directory paths

async function processFiles() {
  const filesArr = await Promise.all(directories.map(dir => fs.readdir(dir)));
  const commonFiles = filesArr[0].filter(file => filesArr[1].includes(file) && filesArr[2].includes(file));

  for (let file of commonFiles) {
    const linesArr = await Promise.all(directories.map(dir => 
      new Promise((resolve, reject) => {
        const lines = new Set();
        const rl = readline.createInterface({
          input: fs.createReadStream(path.join(dir, file)),
          crlfDelay: Infinity
        });
        
        rl.on('line', (line) => {
          lines.add(line);
        });
        
        rl.on('close', () => {
          resolve(lines);
        });
        
        rl.on('error', (err) => {
          reject(err);
        });
      })
    ));

    const commonLines = Array.from(linesArr[0]).filter(line => linesArr[1].has(line) && linesArr[2].has(line));
    const uniqueLines = linesArr.map((lines, index) => 
      Array.from(lines).filter(line => !commonLines.includes(line)).map(line => ({ line, dir: directories[index] }))
    );

    await fs.appendFile('common.properties', commonLines.join('\n') + '\n');
    for (let lines of uniqueLines) {
      for (let { line, dir } of lines) {
        await fs.appendFile(`${dir}.properties`, line + '\n');
      }
    }
  }
}

processFiles().catch(console.error);













// https://github.com/jonasschmedtmann/ultimate-react-course ==> react

// https://github.com/echarlot1/complete-javascript-course ==> javascript 

// const fs = require('fs');
// const path = require('path');

// const directories = [
//   './dir1',
//   './dir2',
//   // Add your directories here
// ];

// const linesByDirectory = {};

// directories.forEach((dir) => {
//   const files = fs.readdirSync(dir).filter(file => file.endsWith('.properties') || file.endsWith('.csv'));

//   files.forEach((file) => {
//     const filePath = path.join(dir, file);
//     const content = fs.readFileSync(filePath, 'utf-8');
//     const lines = content.split('\n').filter(Boolean); // Ignore empty lines

//     lines.forEach((line) => {
//       if (!linesByDirectory[line]) {
//         linesByDirectory[line] = [];
//       }

//       linesByDirectory[line].push(dir);
//     });
//   });
// });

// const commonLines = [];
// const uniqueLinesByDirectory = {};

// for (const line in linesByDirectory) {
//   if (linesByDirectory[line].length === directories.length) {
//     commonLines.push(line);
//   } else {
//     linesByDirectory[line].forEach((dir) => {
//       if (!uniqueLinesByDirectory[dir]) {
//         uniqueLinesByDirectory[dir] = [];
//       }

//       uniqueLinesByDirectory[dir].push(line);
//     });
//   }
// }

// fs.writeFileSync('common.properties', commonLines.join('\n'));

// for (const dir in uniqueLinesByDirectory) {
//   const fileName = dir.replace('./', '') + '.properties';
//   fs.writeFileSync(fileName, uniqueLinesByDirectory[dir].join('\n'));
// }























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



