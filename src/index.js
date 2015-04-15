require("./stylesheets/main.less");

var Dialog = require("./dialog");

var Q = codebox.require("q");
var commands = codebox.require("core/commands");
var dialogs = codebox.require("utils/dialogs");

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
        || navigator.mozGetUserMedia || navigator.msGetUserMedia;


// Register command to open recorder
commands.register({
    id: "recorder.open",
    title: "Recorder: Open",
    run: function() {
        return Q()
        .then(function() {
            var d = Q.defer();

            navigator.getUserMedia(
                { audio:true },
                d.resolve,
                d.reject
            );

            return d.promise;
        })
        .then(function() {
            return dialogs.open(Dialog);
        });
    }
});
