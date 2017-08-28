var gulp = require('gulp')
var concat = require('gulp-concat')

gulp.task('leaflet-bundle', function() {
	return gulp.src([
		'./hmi/externals/leaflet-1.0.3/leaflet.js',
		'./hmi/externals/leaflet.contextmenu.min.js',
		'./hmi/externals/Leaflet.Coordinates.min.js',
		'./hmi/externals/leaflet.rotatedMarker.js',
		'./hmi/externals/leaflet-draw/dist/leaflet.draw.js'
		])
		.pipe(concat('leaflet-bundle.js'))
		.pipe(gulp.dest('./hmi/externals/dist/'))
})