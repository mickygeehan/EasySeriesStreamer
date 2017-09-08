/*jslint browser: true*/
/*global $, jQuery*/
/*jslint plusplus: true */
(function () {
    "use strict";
    var seriesShowing = true,
        episodesAndLinks = [],
        episodeLinks = [],
        episodeNumberToTry = 0;

    getData("The Office").done(handleSearch)





    //Step 1 - Search Function
    //step 2 - Populate table
    //step 3 - On click get seasons and episodes of tv show
    //step 4 - On click season display episodes
    //step 5 - on click episode, decode to get host link, get the video url
    //step 5 - load the video


    //Step 1 & 2 - Search function and populate
    function searchForSeries(input) {

        //Clear the already listed shows
        clearSeriesTable();

        //get request to look for tv shows
        $.get("http://ewatchseries.to/search/" + input, function (data, status) {
            var epTitle,
                epLink;

            //loop through each series
            $(data).find('.search-item-left').each(function () {
                //Get the titles
                epTitle = $(this).find('div:eq(6) > a > strong').text();
                epLink = $(this).find('div:eq(6) > a').attr('href');

                //Step 2 - Populate table
                addSeriesToTable(epTitle, epLink);

            });

        });
    }





    //functions for get req
    function clearSeriesTable() {
        $("#mainTable tbody tr").remove();
    }

    //Table functions
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

    function updateEpisodeTable(seasonNumber) {
        var episodes = episodesAndLinks[seasonNumber],
            i;
        clearEpisodeTable();
        for (i = episodes.length - 1; i >= 0; i--) {
            $('#mainEpiTable').append('<tr><td><a src=' + episodes[i].episodeLink + '>' + episodes[i].episodeTitle + '</td></tr>');
        }
    }





    function getSeasonsForSeries(url) {
        $.get(url, function (data, status) {

            var seasonLength = ($(data).find("#right > div").length - 1) + ($(data).find("#left > div").length - 1),
                seasonNum = seasonLength,
                ulId,
                listItems,
                episodes,
                element, epTitle, epLink, episode;


            addSeasonsToTable(seasonLength);


            for (var i = 1; i <= seasonLength; i++) {
                episodes = [];
                ulId = "#listing_" + i + " li";
                listItems = $(data).find(ulId);

                listItems.each(function (idx, li) {
                    element = $(li);
                    epLink = element.find('a').attr('href');
                    epTitle = element.find('a > span:eq(0)').text();
                    episode = {
                        episodeTitle: epTitle,
                        episodeLink: epLink
                    };

                    episodes.push(episode);

                });

                episodesAndLinks[i] = episodes;

            }




        });
    }

    function checkEpisodeLink(epLink) {
        if (epLink.indexOf("gorilla") !== -1) {
            return checkAlreadyHasHost("gorilla");
        } else if (epLink.indexOf("daclips") !== -1) {
            return checkAlreadyHasHost("daclips");
        } else if (epLink.indexOf("movpod") !== -1) {
            return checkAlreadyHasHost("movpod");
        }

        return false;
    }

    function checkAlreadyHasHost(hostName) {
        var i;

        for (i = 0; i < episodeLinks.length; i++) {
            if (episodeLinks[i].indexOf(hostName) != -1) {
                return false;
            }
        }
        return true;
    }

    function loadVideo(url) {
        var $videoPlayer = $('#videoPlayer');
        if ($videoPlayer.length) {
            $videoPlayer.attr('src', url);
        }
    }

    function getVideoFromHostLink(hostLink) {
        var urlSplit = hostLink.split("/"),
            id = urlSplit[urlSplit.length - 1];

        console.log(hostLink);


        jQuery.ajax({
            url: hostLink,
            type: 'post',
            dataType: 'html',
            data: {
                op: "download1",
                id: id,
                method_free: "Free Download"
            },
            success: function (data) {
                console.log(data);
                var title = $(data).filter('title').text();
                if (title.indexOf("404 - Not Found") != -1) {
                    episodeNumberToTry++;
                    console.log(episodeNumberToTry);
                    getHostVideoLink(episodeLinks[episodeNumberToTry]);
                }
                var url = data.match("http.*.mp4");
                loadVideo(url);
                //episodeNumberToTry = 0;
            }
        });

    }

    function getHostVideoLink(episodeLink) {

        var hostLink = atob(episodeLink.substr(episodeLink.indexOf("r=") + 2));

        getVideoFromHostLink(hostLink);

    }

    function getEpisodeLinks(episodeUrl) {
        $.get(episodeUrl, function (data, status) {
            var epLink = "";

            $(data).find("#myTable > tbody > tr").each(function () {
                //do something with the element here.
                epLink = $(this).find('td:eq(0) > span').text();

                //only check if one of three hosts
                if (checkEpisodeLink(epLink)) {
                    epLink = $(this).find('td:eq(1) > a').attr('href');
                    episodeLinks.push(epLink);
                }


            });

            getHostVideoLink(episodeLinks[0]);
        });


    }





    //functions for series
    function getSeriesUrl(input) {
        return input;
    }

    function getEpisodeUrl(input) {
        return input;
    }






    //Make sure jquery loaded
    $(document).ready(function () {

        //On enter key
        $(document).keypress(function (e) {
            if (e.which === 13) {
                episodesAndLinks = [];
                episodeLinks = [];
                seriesShowing = true;
                searchForSeries($("#searchInput").val());
            }
        });

        //On click the series table
        $('#mainTable').on("click", "td", function () {

            var seriesUrl, seasonNumber;

            //check if series or seasons
            if (seriesShowing) {
                //reset global var
                seriesUrl = $(this).find('a').attr('src');
                getSeasonsForSeries(seriesUrl);
            } else {
                seasonNumber = $(this).parent().parent().children().index($(this).parent()) + 1;

                //add episodes to table
                updateEpisodeTable(seasonNumber);

            }

        });

        $('#mainEpiTable').on("click", "td", function () {
            var episodeUrl = $(this).find('a').attr('src'),
                epName = $(this).text();

            $(".panel-heading h3").text(epName);

            episodeLinks = [];
            getEpisodeLinks(episodeUrl);
        });



    });

}());
