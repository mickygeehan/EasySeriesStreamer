//New way callback
function getDataFromSearch(input) {
    return $.ajax({
        url : "http://ewatchseries.to/search/" + input,
        type: 'GET'
    });
}

function getData(url){
    return $.ajax({
       url : url,
        type: 'GET'
    });
}
