/*!
 * Piwik - free/libre analytics platform
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

/**
 * This file registers the Overlay row action on the pages report.
 */

(function () {

    let actionName = 'SegmentVisitorEventLog';

    function getRawSegmentValueFromRow(tr)
    {
        return $(tr).attr('data-segment-filter');
    }

    function getDataTableFromApiMethod(apiMethod)
    {
        let div = $(require('piwik/UI').DataTable.getDataTableByReport(apiMethod));
        if (div.length && div.data('uiControlObject')) {
            return div.data('uiControlObject');
        }
    }

    function getMetadataFromDataTable(dataTable)
    {
        if (dataTable) {
            return dataTable.getReportMetadata();
        }
    }

    function getDimensionFromApiMethod(apiMethod)
    {
        if (!apiMethod) {
            return;
        }

        let dataTable = getDataTableFromApiMethod(apiMethod);
        let metadata  = getMetadataFromDataTable(dataTable);

        if (metadata && metadata.dimension) {
            return metadata.dimension;
        }
    }

    function DataTable_RowActions_SegmentVisitorEventLog(dataTable) {
        this.dataTable = dataTable;
        this.actionName = actionName;

        // has to be overridden in subclasses
        this.trEventName = 'piwikTriggerSegmentVisitorEventLogAction';
    }

    DataTable_RowActions_SegmentVisitorEventLog.prototype = new DataTable_RowAction();

    DataTable_RowActions_SegmentVisitorEventLog.prototype.trigger = function (tr, e, subTableLabel) {
        let segment = getRawSegmentValueFromRow(tr);

        if (this.dataTable.param.segment) {
            segment = decodeURIComponent(this.dataTable.param.segment) + ';' + segment;
        }

        if (this.dataTable.props.segmented_visitor_log_segment_suffix) {
            segment = segment + ';' + this.dataTable.props.segmented_visitor_log_segment_suffix;
        }

        this.performAction(segment, tr, e);
    };

    DataTable_RowActions_SegmentVisitorEventLog.prototype.performAction = function (segment, tr, e) {
        if (piwikHelper.isAngularRenderingThePage()) {
            let dummyUrl = new URL('http://127.0.0.1');
            dummyUrl.search = window.location.hash.substring(2);
            dummyUrl.searchParams.set('segment', segment);
            window.location.hash = '?' + dummyUrl.searchParams;
        } else {
            broadcast.propagateNewPage('segment=' + encodeURIComponent(segment), true, 'segment=' + encodeURIComponent(segment));
        }
    };

    DataTable_RowActions_Registry.register({

        name: actionName,

        dataTableIcon: 'icon-segment',

        order: 20,

        dataTableIconTooltip: [
            _pk_translate('EventSegmentNavigation_RowActionTooltipTitle'),
            _pk_translate('EventSegmentNavigation_RowActionTooltipDefault')
        ],

        isAvailableOnReport: function (dataTableParams, undefined) {
            return dataTableParams.module === "Events" && piwik.isBrowserArchivingForSegmentsEnabled;
        },

        isAvailableOnRow: function (dataTableParams, tr) {
            let value = getRawSegmentValueFromRow(tr);
            if ('undefined' === (typeof value)) {
                return false;
            }

            let reportTitle = null;

            let apiMethod = $(tr).parents('div.dataTable').last().attr('data-report');
            let dimension = getDimensionFromApiMethod(apiMethod);

            if (dimension) {
                reportTitle = _pk_translate('EventSegmentNavigation_RowActionTooltipWithDimension', [dimension])
            } else {
                reportTitle = _pk_translate('EventSegmentNavigation_RowActionTooltipDefault');
            }

            this.dataTableIconTooltip[1] = reportTitle;

            return true;
        },

        createInstance: function (dataTable, param) {
            if (dataTable !== null && typeof dataTable.SegmentVisitorEventLogInstance != 'undefined') {
                return dataTable.SegmentVisitorEventLogInstance;
            }

            if (dataTable === null && param) {
                // when segmented visitor log is triggered from the url (not a click on the data table)
                // we look for the data table instance in the dom
                let report = param.split(':')[0];
                let tempTable = getDataTableFromApiMethod(report);
                if (tempTable) {
                    dataTable = tempTable;
                    if (typeof dataTable.SegmentVisitorEventLogInstance != 'undefined') {
                        return dataTable.SegmentVisitorEventLogInstance;
                    }
                }
            }

            let instance = new DataTable_RowActions_SegmentVisitorEventLog(dataTable);
            if (dataTable !== null) {
                dataTable.SegmentVisitorEventLogInstance = instance;
            }

            return instance;
        }

    });

})();