<?php
/**
 * Piwik - free/libre analytics platform
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\EventSegmentNavigation;

use Piwik\ArchiveProcessor\Rules;

class EventSegmentNavigation extends \Piwik\Plugin
{
    /**
     * @see \Piwik\Plugin::registerEvents
     */
    public function registerEvents()
    {
        return array(
            'AssetManager.getJavaScriptFiles' => 'getJsFiles',
            'Template.jsGlobalVariables' => 'addJsGlobalVariables',
            'Translate.getClientSideTranslationKeys' => 'getClientSideTranslationKeys'
        );
    }

    public function getClientSideTranslationKeys(&$translationKeys)
    {
        $translationKeys[] = "EventSegmentNavigation_RowActionTooltipTitle";
        $translationKeys[] = "EventSegmentNavigation_RowActionTooltipDefault";
        $translationKeys[] = "EventSegmentNavigation_RowActionTooltipWithDimension";
    }

    public function getJsFiles(&$jsFiles)
    {
        $jsFiles[] = "plugins/EventSegmentNavigation/javascripts/rowaction.js";
    }

    public function addJsGlobalVariables(&$out)
    {
        $browserArchiving = Rules::isBrowserArchivingAvailableForSegments();
        $out .= "piwik.isBrowserArchivingForSegmentsEnabled = $browserArchiving;\n";
    }
}
