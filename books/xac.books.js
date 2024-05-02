var XAC = XAC || {}

const MINCOVERWIDTH = 640
const COVERHEIGHT = 256
const COVERWIDTH = COVERHEIGHT * 3 / 4
//
//	ready function
//
$(document).ready(function () {
    YAML.load('reviews/reviews.yml', (result) => {
        let ulReviewList = $('ul.booklist')
        XAC.reviews = result.reviews
        XAC.reviews.sort(function (a, b) {
            return new Date(b.pubdate) - new Date(a.pubdate)
        })

        for (i = 0; i < XAC.reviews.length; i++) {
            let review = XAC.reviews[i]
            let liReview = $('<li/>')
            liReview.addClass('booklist')
            liReview.css('cursor', 'pointer')

            var strDate = XAC.getDateString(review.pubdate)
            var lbDate = $('<label/>')
            lbDate.addClass('lbdate')
            lbDate.html(strDate)
            liReview.append(lbDate)
            liReview.append('&nbsp;&nbsp;&nbsp;&nbsp;')
            liReview.append(review.title || 'untitled')
            liReview.attr('idx', i)
            liReview.click(function (e) {
                var idxClicked = $(this).attr('idx')
                var reviewClicked = XAC.reviews[idxClicked]
                var file = reviewClicked.file
                XAC.renderMarkdown('reviews/' + file, $('#divReviewContent'), function () {
                    var idxSharp = location.href.indexOf('#')
                    var urlNew = location.href
                    if (idxSharp >= 0) urlNew = urlNew.substring(0, idxSharp)
                    location.href = urlNew + '#' + reviewClicked.url
                    location.reload()
                })
            })

            ulReviewList.append(liReview)
        }

        // load the review as shown in the url
        let url
        let idxSharp = location.href.indexOf('#')
        if (idxSharp >= 0) {
            url = location.href.substring(idxSharp + 1)
        }

        let reviewToLoad
        if (url != undefined) {
            $('ul.booklist').hide()
            for (review of XAC.reviews) {
                if (review.url == url) {
                    reviewToLoad = review
                    break
                }
            }

            XAC.renderMarkdown('reviews/' + reviewToLoad.file, $('#divReviewContent'), function () {
                // add title
                let h1Title = $('<h1 class="h1post"/>')
                h1Title.html(review.title)
                $('#divReviewContent').prepend(h1Title)
                document.title = review.title

                // add author
                let strip = '<label class="lbmeta">'
                strip += 'Reviewed on: ' + XAC.getDateString(review.pubdate)
                strip += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Author: ' + review.author
                strip += '</label>'
                var htmlReview = $('#divReviewContent').html()
                $('#divReviewContent').html(htmlReview.replace('</h1>', '</h1>' + strip))


                // add figure
                let imgBook = $('<img/>')
                imgBook.attr('src', 'reviews/images/' + review.cover)
                imgBook.addClass('bookfigure')
                imgBook.css('width', COVERWIDTH)
                imgBook.css('float', 'left')
                imgBook.css('padding-right', '32px')
                imgBook.css('padding-bottom', '32px')
                $('#divReviewContent').prepend(imgBook)
            })
        }
        else {
            $('#divReview').hide()
            document.title = "Books Read by Anthony"
        }
    })
})