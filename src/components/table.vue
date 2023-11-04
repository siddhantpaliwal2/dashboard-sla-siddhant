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
          <td v-html="highlightMatches(row.status)" v-if="!index || (index && paginatedData[index-1].status !== row.status)" :rowspan="calculateRowspanNew('status', index)" class="width10"></td>
          <td v-html="highlightMatches(row.core)" v-if="!index || (index && paginatedData[index-1].status !== row.status)" :rowspan="calculateRowspanNew('status', index)" class="width1"></td>
          <td class="productColumn" v-html="highlightMatches(row.product)"></td>
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
        <li v-for="n in totalPages" :key="n" class="page-item" :class="{ active: n === currentPage }">
          <button @click="changePage(n)">{{ n }}</button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button @click="currentPage++" :disabled="currentPage === totalPages">Next</button>
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
        console.log("flattened data:", {flatData});
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
      console.log(tmp);


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
      console.log(tmp);
      const flatData = flattenData(tmp);
      const start = (this.currentPage) * this.rowsPerPage;
      console.log(flatData.slice(start, start + this.rowsPerPage))
      return flatData.slice(start, start + this.rowsPerPage);
    },

    filteredData() {
    // Make sure that `filter` is not undefined or null.
    const filterLower = (this.filter || "").toLowerCase();
    
    return this.paginatedData.filter(row => {
      return Object.keys(row).some(key => {
        const value = row[key];
        // Ensure that you only compare strings.
        return typeof value === 'string' && value.toLowerCase().includes(filterLower);
      });
    });
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
      while (i < this.paginatedData.length && this.paginatedData[i][column] === this.paginatedData[index][column]) {
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
    
    calstatusRowspan(data) {
      let sum = Object.keys(data).length + 1;
      for (const cores in data) {
        sum += Object.keys(data[cores]).length;
      }
      return sum;
    },
    
    hideShowALLstatus() {
      if (!document.querySelector(".styled").checked) {
        this.hidestatus = [];
        this.allCheckBox = [];
      }

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


<style scoped>
.fas.fa-times {
  display: none;
}

.fas.fa-times.comment {
  display: block;
}

.overWrittenCells:hover .fas {
  display: block;
}

.innerCells {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.innerCells.comment {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

table {
  width: 100%;
  white-space: nowrap !important;
}

table td {
  position: relative;
}

i {
  cursor: pointer;
}

.legendColorBox {
  margin: 0.4%;
  float: left;
  height: 20px;
  width: 30px;
  border: 1px solid grey;
  margin-right: 4%;
}

.inputBox {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  text-align: center;
  border: 0;
  text-transform: uppercase !important;
}

.inputBoxOverWritten {
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  text-align: center;
  border: 0;
  width: 80px;
  text-transform: uppercase !important;
  background: none !important;
}

.overWrittenCells {
  border: 2px solid rgb(194, 1, 1);
}

.overWrittenCells input {
  outline: 0;
}

input::placeholder {
  color: black;
}

input:focus::-webkit-input-placeholder {
  color: grey;
}

input[disabled] {
  cursor: text;
  background-color: inherit;
  color: black;
}

.legend-labels {
  white-space: nowrap !important;
  padding: 0%;
  display: flex;
  list-style-type: none;
  margin-bottom: 5px;
}

.legend-labels li {
  font-size: small;
  margin-right: 2%;
}

select {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  text-align: center;
  border: 0;
}

table tr td:not(.skip),
table tr th {
  text-align: center;
}

td,
th {
  padding: 2px !important;
  width: 100px;
  border: 1px solid black;
}

.reference {
  width: 1%;
  background-color: #00b0f0;
}

.released {
  width: 1%;
  background-color: #7fff00;
}

.partial {
  width: 1%;
  background-color: #ffa500;
}

.tentative {
  width: 1%;
  background-color: #dcdcdc;
}

.planned {
  width: 1%;
  background-color: #82ffac;
}

.hideBar {
  list-style: none;
  display: flex;
  align-items: center;
  
}

.productColumn {
  width: 27%;
  background-color: white;
}

.checkbox {
  list-style: none;
  display: flex;
}

.checkbox label {
  margin-left: 10px;
}

.redActual {
  width: 1%;
  color: red;
  background-color: #dcdcdc;
}

.width10 {
  width: 6%;
  /* white-space: nowrap !important; */
}

.width1 {
  width: 1%;
  /* white-space: nowrap !important; */
}

.status-launched td{
  background-color: #a8ff51;
}

.status-discontinued td{
  background-color: #ff2c2c;
}

.status-announced td{
  background-color: yellow;
}

.headings{
  background-color: rgba(156, 165, 172, 0.141);
  font-family: Arial, Helvetica, sans-serif;
  
}

.menu{
  padding: 10px;
  height: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%
}
.right-aligned {
  float: right;
}

input[type=text], select {
  width: 100%;
  padding: 12px 20px;
  margin-top: 9px;
  margin-right: 7px;
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  
  margin-left: auto;
  max-width: 200px;
  max-height: 15px;
  
}

</style>