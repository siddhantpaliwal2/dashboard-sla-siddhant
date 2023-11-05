## Local Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Progress
| Task                | Status        |
| ------------------- | ------------- |
| 1. Migrate v2 to v3 | Completed     |
| 2. Pagination       | Completed     |
| 3. Coloring         | Completed     |
| 4. Search           | In Progress   |

### Branches and Code Management

A dev branch was used to ensure source code version control instead of pushing to main directly. Each feature to be implemented was completed in a separate branch. For example, all functionalities related to pagination were completed in the pagination branch.

## Task Details
### 1. Migrating Application from Vue2 to Vue3

Upgrade Workflow
The following workflow walks through the steps of migrating an actual Vue 2 app to Vue 3. 
The full commits can be found https://v3-migration.vuejs.org/migration-build.html.
Note that the actual steps required for your project may vary, and these steps
should be treated as general guidance rather than strict instructions.

In package.json, update vue to 3.1, install @vue/compat of the same version,
and replace vue-template-compiler (if present) with @vue/compiler-sfc:

```sh
{
  "name": "dashboard-sla",
  "version": "0.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port 4173"
  },
  "dependencies": {
    "vue": "^3.1.0",
    "@vue/compat": "^3.1.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.4.0",
    "@vue/compiler-sfc": "^3.1.0",
    "terser": "^5.14.2",
    "vite": "^4.5.0"
  }
}
```

Remove node_modules & package-lock.json file and run ```sh npm install ``` then compile the project and check the version.

### 2. Pagination
Implemented pagination method to apply pagination on the json data and render 100 rows per page. The nested data was first flattened for future ease of use. Flattening the data allowed me to output the data as rows (eg:- row.status). This data was then paginated. 

```sh
function flattenData(productDataByStatus) {
        const flatData = [];
        // Iterate over each status
        for (const [status, cores] of Object.entries(productDataByStatus)) {
          // Iterate over each core within this status
          for (const [core, products] of Object.entries(cores)) {
            // Iterate over each product within this core
            for (const product of products) {
              // Create a flat representation of the row
              flatData.push({
                status: status,
                core: core,
                product: product.Product,
                lithography: product.Lithography,
                threads: product.Threads,
                baseFreq: product.Base_Freq,
                maxTurboFreq: product.Max_Turbo_Freq,
              });
            }
          }
        }
        return flatData;
}
```

```sh
paginatedData() {
      let tmp = {};
    
      //load json data  
      let data = data_json;

      let statusSet = new Set();

       //prepare data for filter by status 
      data.forEach((element) => {
        let status = element.Status;
        let cores = element.Cores;

        // push status to set
        statusSet.add(status);

        if (this.hidestatus.includes(status)) return; // Hide by status
        if (!tmp[status]) tmp[status] = {};
        if (!tmp[status][cores]) tmp[status][cores] = [];

        tmp[status][cores].push(element);
      });

      // sort status in order
      const strings = new Set(statusSet);
      const sortedStringsArray = [...strings].sort();
      statusSet = new Set(sortedStringsArray);
      const flatData = flattenData(tmp);

      //calculate pages 
      this.totalPages = Math.round(Object.keys(flatData).length / 100);
      const start = (this.currentPage) * this.rowsPerPage;

      //returing 100 rows
      return flatData.slice(start, start + this.rowsPerPage);
    }
```

### 3. Coloring Table based on Product Status
Coloring was implemented dynamically on table based on the status.

Below are the coloring code as per status of the product:
| Status                | Color Code                    |
| -------------------   | ----------------------------- |
| Launched              | background-color: #a8ff51     |
| Discontinued          | background-color: #ff2c2c     |
| Announced             | background-color: yellow;     |

### 4. Search
> Note: Current status of this feature is in progress.

