<?php 

use Kirby\Cms\App as Kirby;

\Kirby\Sane\Html::$allowedTags['table'] = ['style'];
\Kirby\Sane\Html::$allowedTags['thead'] = true;
\Kirby\Sane\Html::$allowedTags['tbody'] = true;
\Kirby\Sane\Html::$allowedTags['tr'] = true;
\Kirby\Sane\Html::$allowedTags['th'] = ['colspan', 'rowspan', 'id', 'class', 'width'];
\Kirby\Sane\Html::$allowedTags['td'] = ['colspan', 'rowspan', 'id', 'class', 'width', 'style'];


// register the plugin so it gets loaded
Kirby::plugin('rasteiner/k4-table-writer', []);