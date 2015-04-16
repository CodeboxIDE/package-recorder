var templateForm = require("./templates/form.html");

var _ = codebox.require("hr.utils");
var commands = codebox.require("core/commands");
var FormView = codebox.require("views/form");
var View = codebox.require("hr.view");
var Recorder = require("./recorder");

var Dialog = View.Template.extend({
    tagName: "div",
    className: "component-recorder",
    template: templateForm,
    events: {
        "click .do-save": "doSave",
        "click .do-record": "doRecord",
        "click .do-discard": "doDiscard",
        "click .do-close": "doClose"
    },

    initialize: function() {
        Dialog.__super__.initialize.apply(this, arguments);

        var that = this;

        this.recording = false;
        this.startTime;

        this.recorder;

        this.audioContext = new AudioContext();

        // setup audio recorder
        this.audioInput = this.audioContext.createMediaStreamSource(this.options.localMediaStream);

        this.audioGain = this.audioContext.createGain();
        this.audioGain.gain.value = 0;
        this.audioInput.connect(this.audioGain);
        this.audioGain.connect(this.audioContext.destination);

        this.audioRecorder = new Recorder(this.audioInput);
    },

    // Submit form
    doSave: function(e) {
        if (e) e.preventDefault();

        this.stopRecording();
        this.parent.close(e);
    },

    // Start recording
    doRecord: function(e) {
        if (e) e.preventDefault();

        this.recording = true;
        this.startTime = Date.now();
        this.audioRecorder.record();
    },

    // Stop recording
    stopRecording: function() {
        var that = this;

        // we stop recording
        this.recording = false;
        this.audioRecorder.stop();
        this.audioRecorder.exportWAV(function (blob) {
            that.recordUrl = (window.URL || window.webkitURL).createObjectURL(blob);
            console.log("Audio blob", that.recordUrl);
        });
    },

    // Discard
    doDiscard: function(e) {
        if (e) e.preventDefault();

        this.stopRecording();
    },

    // Close dialog
    doClose: function(e) {
        this.stopRecording();
        this.parent.close(e);
    }
});

module.exports = Dialog;
