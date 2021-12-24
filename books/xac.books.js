var XAC = XAC || {}

const MINCOVERWIDTH = 640
const COVERHEIGHT = 256
const COVERWIDTH = COVERHEIGHT * 3 / 4
//
//	ready function
//
$(document).ready(function () {
    YAML.load('reviews/reviews.yml', (result) => {
        let ulBookList = $('ul.booklist')
        XAC.reviews = result.reviews
        XAC.reviews.sort(function (a, b) {
            return new Date(b.pubdate) - new Date(a.pubdate)
        })

        for (i = 0; i < XAC.reviews.length; i++) {
            let review = XAC.reviews[i]
            let liBook = $('<li/>')
            liBook.addClass('booklist')
            liBook.css('cursor', 'pointer')

            imgBook = $('<img/>')
            imgBook.addClass('book')
            imgBook.attr('src', 'reviews/images/' + review.cover)

            let divBook = $('<div/>')
            divBook.addClass('bookcover')
            if (window.innerWidth < MINCOVERWIDTH) {
                divBook.css('width', '100%')
                imgBook.css('width', '100%')
            } else {
                divBook.css('height', COVERHEIGHT)
                ulBookList.css('columns', (window.innerWidth / COVERWIDTH | 0))
                ulBookList.css('display', 'flex')
                imgBook.css('height', '100%')
            }

            divBook.append(imgBook)
            liBook.append(divBook)

            liBook.attr('idx', i)
            liBook.click(function (e) {
                let idxClicked = $(this).attr('idx')
                let reviewClicked = XAC.reviews[idxClicked]
                var file = reviewClicked.file
                XAC.renderMarkdown('reviews/' + file, $('#divReviewContent'), function () {
                    // XAC.postProcessing(reviewClicked)
                    var idxSharp = location.href.indexOf('#')
                    var urlNew = location.href
                    if (idxSharp >= 0) urlNew = urlNew.substring(0, idxSharp)
                    location.href = urlNew + '#' + reviewClicked.url
                    location.reload()
                })
            })
            ulBookList.append(liBook)
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

                // add author
                let strip = '<label class="lbmeta">'
                // strip += 'Published on: ' + XAC.getDateString(post.pubdate)
                strip += 'Reviewed on: ' + XAC.getDateString(review.pubdate)
	            strip += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Author: ' + review.author
                strip += '</label>'
                var htmlPost = $('#divReviewContent').html()
        	    $('#divReviewContent').html(htmlPost.replace('</h1>', '</h1>' + strip))


                // add figure
                let imgBook = $('<img/>')
                imgBook.attr('src', 'reviews/images/' + review.cover)
                imgBook.addClass('bookfigure')
                imgBook.css('width', COVERWIDTH)
                imgBook.css('float', 'left')
                imgBook.css('padding-right', '32px')
                $('#divReviewContent').prepend(imgBook)
            })
        }
        else {
            $('#divReview').hide()
        }
    })
})