(function ($) {
    'use strict';

    $.extend($.fn.bootstrapTable.defaults, {
        fixedColumns: false,
        fixedNumber: 1
    });

    var BootstrapTable = $.fn.bootstrapTable.Constructor,
        _initHeader = BootstrapTable.prototype.initHeader,
        _initBody = BootstrapTable.prototype.initBody,
        _resetView = BootstrapTable.prototype.resetView;

    BootstrapTable.prototype.initFixedColumns = function () {
        this.$fixedHeader = $([
            '<div class="fixed-table-header-columns">',
            '<table>',
            '<thead></thead>',
            '</table>',
            '</div>'].join(''));

        this.timeoutHeaderColumns_ = 0;
        this.$fixedHeader.find('table').attr('class', this.$el.attr('class'));
        this.$fixedHeaderColumns = this.$fixedHeader.find('thead');
        this.$tableHeader.before(this.$fixedHeader);

        this.$fixedBody = $([
            '<div class="fixed-table-body-columns">',
            '<table>',
            '<tbody></tbody>',
            '</table>',
            '</div>'].join(''));

        this.timeoutBodyColumns_ = 0;
        this.$fixedBody.find('table').attr('class', this.$el.attr('class'));
        this.$fixedBodyColumns = this.$fixedBody.find('tbody');
        this.$tableBody.before(this.$fixedBody);
    };

    BootstrapTable.prototype.initHeader = function () {
        _initHeader.apply(this, Array.prototype.slice.apply(arguments));

        if (!this.options.fixedColumns) {
            return;
        }
        //alert(this.options.fixedNumber)
        this.initFixedColumns();

        var that = this, $trs = this.$header.find('tr').clone();
        $trs.each(function () {
            $(this).find('th:gt(' + (that.options.fixedNumber - 1) + ')').remove();
        });
        var buttons = $trs.find('input')
        //console.log(buttons)
        buttons.click(function () {
            if (!!$(this).is(":checked")) {
                var inputBtnFind = that.$body.find("tr td input");
                inputBtnFind.each(function () {
                    $(this).click();
                })
                $("input[name='btSelectItem']").prop("checked", true)
                //that.$body.find("tr td:eq(" + key + ") input:eq(" + key + ")").click();
            } else {
                var inputBtnFind = that.$body.find("tr td input");
                inputBtnFind.each(function () {
                    $(this).click();
                })
                $("input[name='btSelectItem']").prop("checked", false)

            }
        })

        this.$fixedHeaderColumns.html('').append($trs);
    };

    BootstrapTable.prototype.initBody = function () {
        _initBody.apply(this, Array.prototype.slice.apply(arguments));

        if (!this.options.fixedColumns) {
            return;
        }

        var that = this,
            rowspan = 0;

        this.$fixedBodyColumns.html('');
        this.$body.find('> tr[data-index]').each(function () {
            var $tr = $(this).clone(),
                $tds = $tr.find('td');

            //$tr.html('');这样存在一个兼容性问题，在IE浏览器里面，清空tr,$tds的值也会被清空。
            //$tr.html('');
            var $newtr = $('<tr></tr>');
            $newtr.attr('data-index', $tr.attr('data-index'));
            $newtr.attr('data-uniqueid', $tr.attr('data-uniqueid'));
            var end = that.options.fixedNumber;
            if (rowspan > 0) {
                --end;
                --rowspan;
            }
            for (var i = 0; i < end; i++) {
                //$newtr.append($tds.eq(i).clone());
                //var indexTd = $tds.length - that.options.fixedNumber + i;
                //var oldTd = $tds.eq(indexTd);
                var fixTd = $tds.eq(i).clone();
                var buttons = fixTd.find('input');

                //事件转移：冻结列里面的事件转移到实际按钮的事件
                buttons.each(function (key, item) {
                    $(item).click(function () {
                        that.$body.find("tr[data-index=" + $tr.attr('data-index') + "] td:eq(" + key + ") input:eq(" + key + ")").click();
                    });
                });


                $newtr.append(fixTd);
            }
            that.$fixedBodyColumns.append($newtr);

            if ($tds.eq(0).attr('rowspan')) {
                rowspan = $tds.eq(0).attr('rowspan') - 1;
            }
        });
    };

    BootstrapTable.prototype.resetView = function () {
        _resetView.apply(this, Array.prototype.slice.apply(arguments));

        if (!this.options.fixedColumns) {
            return;
        }

        clearTimeout(this.timeoutHeaderColumns_);
        this.timeoutHeaderColumns_ = setTimeout($.proxy(this.fitHeaderColumns, this), this.$el.is(':hidden') ? 100 : 0);

        clearTimeout(this.timeoutBodyColumns_);
        this.timeoutBodyColumns_ = setTimeout($.proxy(this.fitBodyColumns, this), this.$el.is(':hidden') ? 100 : 0);
    };

    BootstrapTable.prototype.fitHeaderColumns = function () {
        var that = this,
            visibleFields = this.getVisibleFields(),
            headerWidth = 0;

        this.$body.find('tr:first-child:not(.no-records-found) > *').each(function (i) {
            var $this = $(this),
                index = i;

            if (i >= that.options.fixedNumber) {
                return false;
            }

            if (that.options.detailView && !that.options.cardView) {
                index = i - 1;
            }

            that.$fixedHeader.find('th[data-field="' + visibleFields[index] + '"]')
                .find('.fht-cell').width($this.innerWidth());
            headerWidth += $this.outerWidth();
        });
        this.$fixedHeader.width(headerWidth).show();
    };


    var getExplorer = (function () {
        var explorer = window.navigator.userAgent,
            compare = function (s) { return (explorer.indexOf(s) >= 0); },
            ie11 = (function () { return ("ActiveXObject" in window) })();
        if (compare("MSIE") || ie11) { return 'ie'; }
        else if (compare("Firefox") && !ie11) { return 'Firefox'; }
        else if (compare("Chrome") && !ie11) { return 'Chrome'; }
        else if (compare("Opera") && !ie11) { return 'Opera'; }
        else if (compare("Safari") && !ie11) { return 'Safari'; }
    })()

    BootstrapTable.prototype.fitBodyColumns = function () {
        var that = this;
        var top = -(parseInt(this.$el.css('margin-top')) - 1);
        // the fixed height should reduce the scorll-x height

        if (getExplorer == 'Chrome') {
            var height = this.$tableBody.height() - 10
        } else {
            var height = this.$tableBody.height() - 17
        }

        //height = this.$tableBody.height() - 16;
        //debugger;
        if (!this.$body.find('> tr[data-index]').length) {
            this.$fixedBody.hide();
            return;
        }

        if (!this.options.height) {
            top = this.$fixedHeader.height() - 1;
            height = height - top;
        }

        this.$fixedBody.css({
            width: this.$fixedHeader.width(),
            height: height,
            display: "inline-block",
            top: top
        });

        this.$body.find('> tr').each(function (i) {
            that.$fixedBody.find('tr:eq(' + i + ')').height($(this).height() - 0.5);
            var thattds = this;
            //debugger;
            that.$fixedBody.find('tr:eq(' + i + ')').find('td').each(function (j) {
                $(this).width($($(thattds).find('td')[j]).width() + 1);
            });
        });

        // events
        this.$tableBody.on('scroll', function () {
            that.$fixedBody.find('table').css('top', -$(this).scrollTop());
        });
        this.$body.find('> tr[data-index]').off('hover').hover(function () {
            var index = $(this).data('index');
            that.$fixedBody.find('tr[data-index="' + index + '"]').addClass('hover');
        }, function () {
            var index = $(this).data('index');
            that.$fixedBody.find('tr[data-index="' + index + '"]').removeClass('hover');
        });
        this.$fixedBody.find('tr[data-index]').off('hover').hover(function () {
            var index = $(this).data('index');
            that.$body.find('tr[data-index="' + index + '"]').addClass('hover');
        }, function () {
            var index = $(this).data('index');
            that.$body.find('> tr[data-index="' + index + '"]').removeClass('hover');
        });
    };

})(jQuery);

//bootstrap-table-fixed-columns.js