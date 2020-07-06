var readYaml = require('read-yaml')
var writeYaml = require('write-yaml')

var fixflickr = function (project) {
    if (project.flickr == undefined) return

    if (project.flickr.length <= 0) {
        delete project.flickr
        return
    }

    var prefix = 'albums/'
    var idxAlbumId = project.flickr.indexOf(prefix)
    var strFlickr = project.flickr.substring(idxAlbumId + prefix.length)
    var albumId = ""
    while (parseInt(strFlickr[0]) >= 0) {
        albumId += strFlickr[0]
        strFlickr = strFlickr.substring(1)
    }
    console.log(albumId)
    project.flickr = albumId
}

readYaml('../../data.yml', function (err, data) {
    for (project of data.specials) fixflickr(project)
    for (project of data.fabrication) fixflickr(project)
    for (project of data.interactiontechniques) fixflickr(project)
    for (project of data.internetofthings) fixflickr(project)

    writeYaml('data.yml', data, function (err) {
		if (err != null) console.log(err)
	})
})