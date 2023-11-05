<template>
  <div>
    <!-- Hide By status Bar -->
    <div class="menu">
      <div class="hideBar">
        <label class="hideLabel">Hide:</label>
        <div class="checkbox">
          <!-- All status -->
          
          <label for="allStatuses">All statuses</label>
          <input
            id="allStatuses"
            type="checkbox"
            class="styled"
            @click="hideShowALLstatus"
            v-model="allCheck"
          />

          <!-- Dynamic status checkboxes -->
          <div v-for="status in productDataBystatus.status" :key="status">
           
            <label :for="status">{{ status }}</label>
            <input
              :id="status"
              type="checkbox"
              class="styled"
              :value="status"
              v-model="hidestatus"
            />
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
          <td  v-html = highlightMatches(row.status) v-if="!index || (index && filteredData[index-1].status !== row.status)" :rowspan="calculateRowspanNew('status', index)" class="width10"></td>
          <td  v-html = highlightMatches(row.core) v-if="!index || (index && filteredData[index-1].status !== row.status)" :rowspan="calculateRowspanNew('status', index)" class="width1"></td>
          <td v-html = highlightMatches(row.product) class="productColumn"></td>
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
        <li v-if="this.totalPages != 0" v-for="n in this.totalPages - 1" :key="n" class="page-item">
          <button @click="currentPage = n" class="page-number" :class="{ active: n === currentPage }">{{ n }}</button>
        </li>
        <li v-if="this.totalPages != 0" class="page-item">
          <button @click="currentPage++" :disabled="currentPage ===  this.totalPages -1">Next</button>
        </li>
      </ul>
    </nav>
  </div>
</template>


<script src = ./table></script>
<style>
  @import '../../assets/css/table/table.css';
</style>

