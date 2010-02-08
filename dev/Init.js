////////////////////////////////////////////////////////////////////////////////
//
//  Initialization Code
//
//  Copyright (c) 2009 Jon Thompson
//
////////////////////////////////////////////////////////////////////////////////
//
/// \file Init.js
/// \brief Code that initialized the application
/// \author Jon Thompson
/// \created February 7, 2009
//
////////////////////////////////////////////////////////////////////////////////

/*******************************************************************************
   Copyright 2010 Jon Thompson (www.initiativetracker.com)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*******************************************************************************/


// Basic initialization
dojo.addOnLoad(function()
{
    // Connect the misc menu
    var btnMisc = dijit.byId("Toolbar.Misc");
    dojo.connect(btnMisc, "onClick", btnMisc, "_onArrowClick");

    // Initiatlize the combatants list
    CombatantList.Instance.Initialize("Combatants", "WebPages", "Notes");   
    
    // Connect the special splitter events
    // ** Actually had to modify the dojo source code to get this connection **
    // ** BorderContainer, in the functions _startDrag and _stopDrag **
    dojo.subscribe("SplitterStartDrag", function()
    {
        ShowElements(dojo.doc.body.getElementsByTagName("iframe"), false);
    });
    
    dojo.subscribe("SplitterStopDrag", function()
    {
        ShowElements(dojo.doc.body.getElementsByTagName("iframe"), true);  
    });    
    
    // Drop the loadscreen
    
    dojo.byId("LoadScreen").style.display = "none";  
    
    // If the storage manager is ready, then we can do the storage based init
    // right here, otherwise we need to wait for the manager to initialize
    if (!dojox.storage.manager.isInitialized())
    { 
        // Storage system not initialized, wait until it is
        dojox.storage.manager.addOnLoad(OnStorageInitialize);
    }
    else
    {
        // Storage system is ready, call the init now
        OnStorageInitialize();
    }
});


// Storage related initialization
var bCurrentLoaded = false;
function OnStorageInitialize()
{
    // Load the current list
    if (!bCurrentLoaded)
    {
        CombatantList.Instance.Load("CombatantList", "Current");
    }
    bCurrentLoaded = true;                  
}

// Called when the page is navigated away from
window.onbeforeunload = function()
{    
    if (bCurrentLoaded)
    {
        CombatantList.Instance.Save("CombatantList", "Current");
    }
    
    if (BROWSER == B_IE)
    {
        // Work around a race condition related to flash unloading in IE
        var backup = window.__flash__removeCallback;
        window.__flash__removeCallback = function (instance, name) { try {backup(instance, name)} catch (x){} };            
    }
}


