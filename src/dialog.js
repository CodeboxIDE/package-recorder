var templateForm = require("./templates/form.html");
var Recorder = require("./recorder");

var _ = codebox.require("hr.utils");
var commands = codebox.require("core/commands");
var FormView = codebox.require("views/form");
var View = codebox.require("hr.view");
var File = codebox.require("models/file");
var dialogs = codebox.require("utils/dialogs");

var Dialog = View.Template.extend({
    tagName: "div",
    className: "component-recorder",
    template: templateForm,
    events: {
        "click .do-save": "doSave",
        "click .do-record": "doRecord",
        "click .do-stop": "doStop",
        "click .do-close": "doClose"
    },

    initialize: function() {
        Dialog.__super__.initialize.apply(this, arguments);

        var that = this;

        this.recording = false;
        this.startTime;
        this.recordUrl;
        this.recordBlob;

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

    templateContext: function() {
        return {
            recordUrl: this.recordUrl,
            recording: this.recording
        };
    },

    // Submit form
    doSave: function(e) {
        var that = this;

        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }

        if (!this.recordBlob) return;

        return File.saveAs("untitled.wav", this.recordBlob)
        .then(function() {
            that.parent.close(e);
        })
        .fail(dialogs.error);
    },

    // Start recording
    doRecord: function(e) {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }

        this.recording = true;
        this.startTime = Date.now();
        this.audioRecorder.record();
        this.update();
    },

    // Stop recording
    stopRecording: function() {
        var that = this;
        if (!this.recording) return;

        // we stop recording
        this.recording = false;
        this.audioRecorder.stop();
        this.audioRecorder.exportWAV(function (blob) {
            that.recordBlob = blob;
            that.recordUrl = (window.URL || window.webkitURL).createObjectURL(blob);
            that.update();
        });
    },

    // Stop recording
    doStop: function(e) {
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
