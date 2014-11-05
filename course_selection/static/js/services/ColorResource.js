define(["require", "exports"], function(require, exports) {
    var ColorResource = (function () {
        function ColorResource($resource) {
            this.$resource = $resource;
            this.courseColorMap = {};
            this.initCourseColorMap();
            this.initUsableColors();
        }
        // get course color map for this user, this schedule
        ColorResource.prototype.initCourseColorMap = function () {
        };

        // usableColors = defaultColors - colors in courseColorMap
        // TODO: finish this
        ColorResource.prototype.initUsableColors = function () {
            this.usableColors = ColorResource.defaultColors.slice();
        };

        ColorResource.prototype.addColor = function (color) {
            this.usableColors.push(color);
        };

        // return a random usable color in usableColors
        ColorResource.prototype.nextColor = function () {
            if (this.usableColors.length == 0) {
                this.initUsableColors();
            }

            var idx = Math.floor(Math.random() * this.usableColors.length);
            var color = this.usableColors.splice(idx, 1)[0];
            return color;
        };
        ColorResource.$inject = ['$resource'];

        ColorResource.defaultColors = [
            {
                selected: "rgb(45, 98, 52)",
                unselected: "rgb(208, 222, 207)",
                border: "rgb(45, 98, 52)"
            },
            {
                selected: "rgb(56, 92, 146)",
                unselected: "rgb(213, 220, 236)",
                border: "rgb(56, 92, 146)"
            },
            {
                selected: "rgb(149, 73, 98)",
                unselected: "rgb(235, 210, 219)",
                border: "rgb(149, 73, 98)"
            },
            {
                selected: "rgb(137, 94, 46)",
                unselected: "rgb(231, 220, 206)",
                border: "rgb(137, 94, 46)"
            }
        ];
        return ColorResource;
    })();

    
    return ColorResource;
});
