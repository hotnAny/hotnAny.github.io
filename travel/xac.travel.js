var XAC = XAC || {}

const MOBILEWIDTH = 640

// 
// 
// 
$(document).ready(function () {
    XAC.isMobile = mobileCheck()
    let layout = XAC.isMobile ? "mobile_layout.html" : "regular_layout.html"

    if (XAC.isMobile) {
        $('body').css('font-size', '28pt')
    }

    let xhr = new XMLHttpRequest()
    xhr.open('GET', layout, true);

    YAML.load('trips.yml', (result) => {

        XAC.trips = result.trips

        xhr.onreadystatechange = function () {
            if (this.readyState !== 4) return
            if (this.status !== 200) return
            // document.body.innerHTML = this.responseText
            $('div.trips').html(this.responseText)

            // toc
            initTOC()

            // photo
            initPhoto()

            // caption
            initCaption()

            $('li.trip:first').trigger('click')

            $('body').on('keydown', (e) => {
                if(e.keyCode == 37) {
                    $('a.prev').trigger('click')
                } else if(e.keyCode == 39) {
                    $('a.next').trigger('click')
                }
            })
        }

        xhr.send()
    })
    
})

//
//
//
let mobileCheck = () => {
    return screen.width < MOBILEWIDTH
}

//
//
//
let initTOC = () => {
    let ulTOC = $('<ul/>')
    ulTOC.addClass('toc')
    for(let i=0; i<XAC.trips.length; i++) {
        let trip = XAC.trips[i]
        let liTrip = $('<li/>')
        liTrip.addClass('trip')
        // liTrip.addClass('unselected')
        liTrip.css('cursor', 'pointer')
        liTrip.attr('index', i)
        liTrip.html(trip.date + ': ' + trip.place)
        liTrip.click((e)=>{
            // change list item style
            $('li.trip.selected').removeClass('selected')
            $(e.target).addClass('selected')

            // show memories
            XAC.idxMemories = 0
            updateMemory()

        })
        ulTOC.append(liTrip)
    }
    $('td.toc').append(ulTOC)
}

//
//
//
let initPhoto = () => {
    if(XAC.isMobile) {

    } else {
        $('a.photo').css('height', window.innerHeight * 0.8)
    }
}

//
//
//
let initCaption = () => {
    $('a.prev').click((e) => {
        XAC.idxMemories -= 1
        updateMemory()
    })
    $('a.next').click((e) => {
        XAC.idxMemories += 1
        updateMemory()
    })
}

//
//
//
let updateMemory = () => {
    let i = $('li.trip.selected').attr('index')
    i = parseInt(i)
    let trip = XAC.trips[i]
    // log(trip.memories)
    XAC.idxMemories = (XAC.idxMemories + trip.memories.length) % (trip.memories.length)
    let memory = trip.memories[XAC.idxMemories]
    $('img.memory').attr('src', memory.photo)
    $('b.caption').html(memory.caption)
    $('p.description').html(memory.description)
}