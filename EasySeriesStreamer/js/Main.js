/*jslint browser: true*/
/*global $, jQuery*/
/*jslint plusplus: true */
(function () {
    "use strict";
    var seriesShowing = true,
        episodesAndLinks = [],
        episodeLinks = [],
        episodeNumberToTry = 0;


    //Handlers
    function handleSearch(data) {
        clearSeriesTable();
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
    }

    function handleSeasonAndEp(data) {
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
            seriesShowing = false;

        }
    }

    function handleEpisodeLinks(data) {
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
    }

    function handleEpisodeHostLinks(data) {
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

        var hostVideoUrl = getHostVideoLink(episodeLinks[0]);
        getVideoFromHostLink(hostVideoUrl);
    }


    //Get video link decode
    function getHostVideoLink(episodeLink) {

        return atob(episodeLink.substr(episodeLink.indexOf("r=") + 2));

    }



    //Step 1 - Search Function
    //step 2 - Populate table
    //step 3 - On click get seasons and episodes of tv show
    //step 4 - On click season display episodes
    //step 5 - on click episode, decode to get host link, get the video url
    //step 5 - load the video

    //These 2 together
    function checkEpisodeLink(epLink) {
        if (epLink.indexOf("gorilla") !== -1) {
            return true;
        } else if (epLink.indexOf("daclips") !== -1) {
            return true;
        } else if (epLink.indexOf("movpod") !== -1) {
            return true;
        }

        return false;
    }

    function loadVideo(url) {
        var $videoPlayer = $('#videoPlayer');
        if ($videoPlayer.length) {
            $videoPlayer.attr('src', url);
        }
    }

    //Recursion
    function getVideoFromHostLink(hostLink) {
        var urlSplit = hostLink.split("/"),
            id = urlSplit[urlSplit.length - 1];

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
                    hostLink = getHostVideoLink(episodeLinks[episodeNumberToTry]);
                    getVideoFromHostLink(hostLink);
                }
                var url = data.match("http.*.mp4");
                loadVideo(url);
                episodeNumberToTry = 0;
            }
        });

    }



    //table
    function updateEpisodeTable(seasonNumber) {
        var episodes = episodesAndLinks[seasonNumber],
            i;
        clearEpisodeTable();
        for (i = episodes.length - 1; i >= 0; i--) {
            $('#mainEpiTable').append('<tr><td><a src=' + episodes[i].episodeLink + '>' + episodes[i].episodeTitle + '</td></tr>');
        }
    }





    //Make sure jquery loaded
    $(document).ready(function () {

        //On enter key
        $(document).keypress(function (e) {
            if (e.which === 13) {
                episodesAndLinks = [];
                episodeLinks = [];
                seriesShowing = true;
                getDataFromSearch($("#searchInput").val()).done(handleSearch);
            }
        });

        //On click the series table
        $('#mainTable').on("click", "td", function () {

            var seriesUrl, seasonNumber;

            //check if series or seasons
            if (seriesShowing) {
                //reset global var
                seriesUrl = $(this).find('a').attr('src');
                getData(seriesUrl).done(handleSeasonAndEp);

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
            //getData(url).done(handleEpisodeLinks);

            //getEpisodeLinks(episodeUrl);
            getData(episodeUrl).done(handleEpisodeHostLinks);
            console.log(episodeLinks);
        });



    });

}());
