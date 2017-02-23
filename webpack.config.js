module.exports = {
    // where is the entry point to our app
    //context: __dirname + '/public/assets/js/voice-verification',
	entry: './src/app.js',
    output: {
        // where are the files we want to compile
         path: './public/dist/js',
         // where do we want to output the compiled 
         filename: 'maps.bundle.js'
     },
    module: {
        loaders: [{
            // use babel to compile the ES6 
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
        }, {
            // allows us to load in html markup to JS 
            test: /\.html$/,
            loader: 'raw'
        }]
     },
     // show colours in the console output
    stats: {
        colors: true
    }
}