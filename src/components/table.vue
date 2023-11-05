<template>
  <div>
    <!-- Hide By status Bar -->
    <div class="menu">
      <div class="hideBar">
        <label class="hideLabel">Hide:</label>
        <div class="checkbox">
          <!-- All status -->
          <input
            id="allStatuses"
            type="checkbox"
            class="styled"
            @click="hideShowALLstatus"
            v-model="allCheck"
          />
          <label for="allStatuses">All statuses</label>

          <!-- Dynamic status checkboxes -->
          <div v-for="status in productDataBystatus.status" :key="status">
            <input
              :id="status"
              type="checkbox"
              class="styled"
              :value="status"
              v-model="hidestatus"
            />
            <label :for="status">{{ status }}</label>
          </div>
        </div>
      </div>
      
      <input type="text" placeholder="Search for product code" v-model="filter" />
      
    </div>
    

    <!-- Main Table Design -->
    <table>
      <thead class = "headings">
        <tr>
          <th colspan="12">Dashboard SLA</th>
        </tr>
        <tr>
          <th colspan="3">{{ wwData }}</th>
          <th colspan="8">Product Info</th>
        </tr>
        <tr class="headings">
          <th>Status</th>
          <th>Cores</th>
          <th class="width1">Product</th>
          <th class="width1">Lithography</th>
          <th>Threads</th>
          <th>Base Freq</th>
          <th>Max Turbo Freq</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in filteredData" :key="index" :class="getStatus(row.status)">
          <td  v-if="!index || (index && filteredData[index-1].status !== row.status)" :rowspan="calculateRowspanNew('status', index)" class="width10">{{ row.status }}</td>
          <td  v-if="!index || (index && filteredData[index-1].status !== row.status)" :rowspan="calculateRowspanNew('status', index)" class="width1">{{ row.core }}</td>
          <td class="productColumn">{{ row.product }}</td>
          <td>{{ row.lithography }}</td>
          <td><div class="innerCells">{{ row.threads }}</div></td>
          <td><div class="innerCells">{{ row.baseFreq }}</div></td>
          <td><div class="innerCells">{{ row.maxTurboFreq }}</div></td>
          <!-- ... other cells ... -->
        </tr>
      </tbody>
    </table>

    <!-- Pagination Navigation -->
    <nav aria-label="Page navigation">
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: currentPage === 0 }">
          <button @click="currentPage--" :disabled="currentPage === 0">Previous</button>
        </li>
        <li v-for="n in this.totalPages - 1" :key="n" class="page-item">
          <button @click="currentPage = n" class="page-number" :class="{ active: n === currentPage }">{{ n }}</button>
        </li>
        <li class="page-item">
          <button @click="currentPage++" :disabled="currentPage ===  this.totalPages -1">Next</button>
        </li>
      </ul>
    </nav>
  </div>
</template>


<script>
import data_json from "../assets/data.json";

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

export default {
  data: function () {
    return {
      hidestatus: [],
      allCheckBox: [],
      UIData: [],
      wwInfo: {},
      allCheck: false,
      currentPage: 0,
      rowsPerPage: 100,
      searchQuery: '',
      filter: ''
    };
  },
  mounted() {
    this.UIData = data_json;
    this.wwInfo = this.getWWFromDate();
  },
  computed: {
    
    wwData() {
      return `${this.wwInfo.year}WW${this.wwInfo.workweek}.${this.wwInfo.numofday}`;
    },

    productDataBystatus() {
      let tmp = {};
      let data = data_json;
      let statusSet = new Set();

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


      return {
        status: [...statusSet],
        data: tmp,
      };
    },
    
    paginatedData() {
      // You now call the external flattenData function and pass the data it needs.
      let tmp = {};
      let data = data_json;
      let statusSet = new Set();

      console.log("pagined: " + this.hidestatus);

      data.forEach((element) => {
        let status = element.Status;
        let cores = element.Cores;

        // push status to set
        statusSet.add(status);
        console.log("Row status" + status);

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
      return flatData;
      
    },

    filteredData() {
    // Make sure that `filter` is not undefined or null.
    const filterLower = (this.filter || "").toLowerCase();
    
    let d =  this.paginatedData.filter(row => {
      return Object.keys(row).some(key => {
        const value = row[key];
        // Ensure that you only compare strings.
        return typeof value === 'string' && value.toLowerCase().includes(filterLower);
      });
    });

    const start = (this.currentPage) * this.rowsPerPage;
      this.totalPages = Math.round(Object.keys(d).length / 100);
      return d.slice(start, start + this.rowsPerPage);
  },
  
  },
  methods: {
    highlightMatches(text) {
  // Escape the 'filter' to safely use it in a regular expression
  const escapedFilter = this.filter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // If there's no search term, don't attempt to highlight anything
  if (!escapedFilter) return text;

  const re = new RegExp(escapedFilter, 'g');
  return text.replace(re, matchedText => `<strong>${matchedText}</strong>`);
},


    getStatus(status){
      switch(status.toLowerCase()){
        case 'launched' || 'launched(with ipu)':
          return 'status-launched'
        case 'discontinued':
          return 'status-discontinued'
        case 'announced':
          return 'status-announced'
        default:
          return 'status-announced'
      }

    },
    
    calculateRowspanNew(column, index) {
      let rowspan = 1;
      let i = index + 1;
      while (i < this.filteredData.length && this.filteredData[i][column] === this.filteredData[index][column]) {
        rowspan++;
        i++;
      }
      return rowspan;
    },
    getWWFromDate(date = null) {
      let currentDate = date || new Date();
      let startDate = new Date(currentDate.getFullYear(), 0, 1);
      let days = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000));

      return {
        year: currentDate.getFullYear(),
        workweek: Math.ceil(days / 7),
        numofday: currentDate.getDay(),
      };
    },

    movePages(amount) {
    const newPage = this.currentPage + amount;
    if (newPage >= 0 && newPage < this.totalPages) { // Notice the strict less than
      this.currentPage = newPage;
    }
  },
    
    hideShowALLstatus() {
      if (!document.querySelector(".styled").checked) {
        this.hidestatus = [];
        this.allCheckBox = [];
      }

      console.log("chedk: " + document.querySelector(".styled").checked);

      if (document.querySelector(".styled").checked) {
        this.hidestatus = this.productDataBystatus.status;
        this.allCheckBox = this.productDataBystatus.status;
      }

      this.allCheck = !this.allCheck;

      if (this.allCheck) {
      } else {
        this.hidestatus = [];
        this.allCheckBox = [];
      }
    },
  },
}

</script>
<style>
  @import '../assets/css/table/table.css';
</style>

