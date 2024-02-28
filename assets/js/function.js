function generateURL(urlBase,spreadsheetId,sheetName,columnRange,apiKey){
  return urlBase + spreadsheetId + '/values/' + sheetName + '!' + columnRange + '?key=' + apiKey;
}
function getSaldoNow(url){
  $.ajax({
      url: url,
      dataType: 'json',
      success: function(data) {
          $.each(data.values, function(index, row) {
              if(row[0]!=''){
                var saldo = row[0].replace(',','.').replace(',','.')
                $('#txt-saldo').html(saldo)
              }
          })
      },
      error: function(xhr, status, error) {
          console.error('Error:', error);
      }
  });
}
function generateTablePembayaran(startDate,endDate,url_pembayaran,pembayaran_perbulan){
  var dateRange = generateDateRange(startDate, endDate);
  var columnHeaders = generateColumnHeaders(dateRange);
  var tableHeaderHTML = createTableHeader(columnHeaders);
  $('#tabel-header').append(tableHeaderHTML);
  $('#tabel-footer').append(tableHeaderHTML);
  $.ajax({
      url: url_pembayaran,
      dataType: 'json',
      success: function(data) {
          var no = 0
          var belum_terkumpul=0

          var tbl_body = $('#tabel-body');
          tbl_body.empty()
          $.each(data.values, function(index, row) {
              if(row[0]!=''){
                  no++
                  var html_str = '<tr>' +
                                 '<th scope="col">' + row[0] + '</th>'
                  for (var i = 1; i < columnHeaders.length+1; i++) {
                      jml = row[i] || '-'
                      var angka = 0
                      var color = ''
                      if(jml!='-'){
                          color = 'background-color:#A9E7C5;'
                      }else{
                          belum_terkumpul+=pembayaran_perbulan
                      }
                      html_str += '<td scope="col" style="white-space:nowrap;'+color+'" class="text-center"><b>' + jml + '</b></td>'
                  }
                  html_str+='</tr>'
                  tbl_body.append(html_str);
              }
          });

          let saldo = convertCurrencyToInt($('#txt-saldo').html())

          $('#txt-peserta').html(no+' <small>Peserta</small>')
          $('#txt-belum-terkumpul').html(formatRupiah(belum_terkumpul))
          $('#txt-perkiraan').html(formatRupiah(saldo+belum_terkumpul))
      },
      error: function(xhr, status, error) {
          console.error('Error:', error);
      }
  });
}
function generatePemasukanLuar(url){
  $.ajax({
      url: url,
      dataType: 'json',
      success: function(data) {
          var no = 0
          var total=0

          var tbl_body = $('#body-pemasukan-luar');
          tbl_body.empty()
          $.each(data.values, function(index, row) {
              if(row[0]!=''){
                  no++
                  total+=convertCurrencyToInt(row[2])
                  var html_str = '<tr>' +
                                 '<td>' + no + '</td>'+
                                 '<td>' + row[0] + '</td>'+
                                 '<td>' + row[1] + '</td>'+
                                 '<td>' + row[2] + '</td>'
                  tbl_body.append(html_str);
              }
          });
          tbl_body.append('<tr><td colspan="3" class="text-center"><b>TOTAL</b></td><td><b>'+formatRupiah(total)+'</b></td></tr>');
      },
      error: function(xhr, status, error) {
          console.error('Error:', error);
      }
  });
}
function generatePemanfaatanDana(url){
  $.ajax({
      url: url,
      dataType: 'json',
      success: function(data) {
          var no = 0
          var total=0

          var tbl_body = $('#body-pemanfaatan-dana');
          tbl_body.empty()
          $.each(data.values, function(index, row) {
              if(row[0]!=''){
                  no++
                  total+=convertCurrencyToInt(row[2])
                  var html_str = '<tr>' +
                                 '<td>' + no + '</td>'+
                                 '<td>' + row[0] + '</td>'+
                                 '<td>' + row[1] + '</td>'+
                                 '<td>' + row[2] + '</td>'
                  tbl_body.append(html_str);
              }
          });
          tbl_body.append('<tr><td colspan="3" class="text-center"><b>TOTAL</b></td><td><b>'+formatRupiah(total)+'</b></td></tr>');
      },
      error: function(xhr, status, error) {
          console.error('Error:', error);
      }
  });
}
function generateDateRange(startDate, endDate) {
    var dateRange = [];
    var currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        dateRange.push(new Date(currentDate)); 
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return dateRange;
}
function generateColumnHeaders(dateRange) {
    var columnHeaders = [];
    var uniqueYears = [];
    dateRange.forEach(function(date) {
        var year = date.getFullYear();
        if (!uniqueYears.includes(year)) {
            uniqueYears.push(year);
        }
    });
    uniqueYears.forEach(function(year) {
        var monthHeaders = [];
        dateRange.forEach(function(date) {
            if (date.getFullYear() === year) {
                var month = date.toLocaleDateString('id-US', { month: 'long' });
                if (!monthHeaders.includes(month)) {
                    monthHeaders.push(month);
                }
            }
        });
        monthHeaders.forEach(function(month) {
            columnHeaders.push({ year: year, month: month });
        });
    });
    return columnHeaders;
}

function createTableHeader(columnHeaders) {
    var tableHeader = '<tr>' +
                      '<th scope="col" class="text-center">NAMA PESERTA</th>';
    var yearColumns = {};
    columnHeaders.forEach(function(date) {
        tableHeader += '<th scope="col" style="white-space:nowrap;background-color:#7132B2;" class="text-center">' + date['month'] + '<br><small>' + date['year'] + '</small></th>';
    });
    tableHeader += '</tr>';
    return tableHeader;
}
function convertCurrencyToInt(currencyString) {
    return parseInt(currencyString.replace(/[^\d]/g, ''));
}
function formatRupiah(amount) {
    var formattedValue = amount.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR'
    });
    formattedValue = formattedValue.replace(',00', '');
    return formattedValue;
}