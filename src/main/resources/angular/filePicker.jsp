<input name="{{propName}}" type="hidden" value="" ng-disabled="enablePicker"/>

<script type="text/ng-template" id="treeItem.html">
   <input name="{{item.name}} - {{item.checked}}" id="{{item.name}}{{item['$$hashKey'].split(':')[1]}}" class="pathPicker" type="radio" ng-if="isFile(item)" ng-model="atsettings.file" ng-value="item.path" ng-disabled="!enablePicker" ng-change="getContentForEdition(item.path, item)"/>&nbsp;
    <span ng-click="item.displayed = !item.displayed">
        <md-icon ng-show="getIcon(tree,'file')">insert_drive_file</md-icon>
        <md-icon ng-show="getIcon(tree,'folder_open')">folder_open</md-icon>
        <md-icon ng-show="getIcon(tree, 'folder')">folder</md-icon>
        {{item.name}}
    </span>

    <ul ng-show="item.displayed">
        <li ng-repeat="item in item.children" ng-include="'treeItem.html'" class="parent_li">
        </li>
    </ul>
</script>

<div class="tree">
    <ul>
        <li class="parent_li">
            <span ng-click="tree.displayed = !tree.displayed">
                <md-icon ng-show="getIcon(tree,'file')">insert_drive_file</md-icon>
                <md-icon ng-show="getIcon(tree,'folder_open')">folder_open</md-icon>
                <md-icon ng-show="getIcon(tree, 'folder')">folder</md-icon>
                {{tree.name}}
            </span>
            <ul ng-show="tree.displayed">
                <li ng-repeat="item in tree.children" ng-include="'treeItem.html'"
                    class="parent_li">

                </li>
            </ul>
        </li>
    </ul>
</div>