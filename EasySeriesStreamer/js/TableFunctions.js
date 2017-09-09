//Functions for the tables
function clearSeriesTable() {
    $("#mainTable tbody tr").remove();
}

function addSeriesToTable(seriesTitle, seriesLink) {
    $('#mainTable').append('<tr><td><a src=' + seriesLink + '>' + seriesTitle + '</td></tr>');
}

function clearEpisodeTable() {
    $("#mainEpiTable tbody tr").remove();
}

function addSeasonsToTable(length) {
    clearSeriesTable();
    var i, x;
    for (i = 0; i < length; i++) {
        x = i + 1;
        $('#mainTable').append('<tr><td>' + "Season " + x + '</td></tr>');
    }
    seriesShowing = false;
}


