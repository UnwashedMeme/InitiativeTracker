////////////////////////////////////////////////////////////////////////////////
//
//  Prompts
//
//  Copyright (c) 2009 Jon Thompson
//
////////////////////////////////////////////////////////////////////////////////
//
/// \file Prompts.js
/// \brief Classes to handle the various prompts used by the application
/// \author Jon Thompson
/// \created January 25, 2009
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


////////////////////////////////////////////////////////////////////////////////
// Common Prompt Parent
////////////////////////////////////////////////////////////////////////////////

dojo.declare("Prompt", null,
{
// General constructor for a prompt
constructor: function()
{
},

// Sets the HTML ID that this dialog corresponds to
SetID: function (a_idDialog)
{
    this.m_idDialog = a_idDialog;
    
    // Connect the events
       
    dojo.connect(dijit.byId(this.m_idDialog), "execute", this, "OnOK");      
    
    
},

// Sets the default parameters for the prompt
SetDefaultParameters: function (a_hParameters)
{
    this.m_hParameters = a_hParameters;
},

// Registers the ok button for the dialog
RegisterOK: function(a_idOKButton)
{
    // Disable the OK button when the form is invalid
    dojo.connect(dijit.byId(this.m_idDialog), "onValidStateChange", function(bValid)
    {
        dijit.byId(a_idOKButton).attr('disabled', !bValid)
    });
    
    
    // Handle enter as pressing OK
    var sID = this.m_idDialog;
    dojo.connect(dijit.byId(this.m_idDialog), "onKeyPress", 
    function(a_eKey)
    {
        switch (a_eKey.charOrCode)
        {
            // Submit on enter
            case dojo.keys.ENTER:
            {
                var oDialog = dijit.byId(sID);
                if (oDialog.validate())
                {
                    // Force a focus change
                    dijit.byId(a_idOKButton).focus();
                    
                    // Submit
                    oDialog._onSubmit();
                }
            }
            break;
        }  
    });
},

// Registers the cancel button for the dialog
RegisterCancel: function(a_idCancelButton)
{
    dojo.connect(dijit.byId(a_idCancelButton), "onClick", this, "OnCancel");
},

// Sets up a checkbox
SetupCheckbox: function(a_idCheckbox)
{
    dojo.connect(dijit.byId(a_idCheckbox), "onKeyDown",     
    function(a_eKey)
    {
        switch (a_eKey.keyCode)
        {
            case dojo.keys.SPACE:
            {
                dijit.byId(a_idCheckbox).attr("value", 
                    !dijit.byId(a_idCheckbox).attr("value"));                 
            }
            break;
        }
    });
},

GetDialogObject: function()
{
    return dijit.byId(this.m_idDialog);
},

// Internal method for showing the dialog
Show: function (a_hParametersOverride)
{
    // Use either the default parameters or the ones passed in
    var hParameters = a_hParametersOverride != null ? a_hParametersOverride : this.m_hParameters;

    // Populate the prompt parameters
    if (hParameters != null)
    {
        for (var sParameter in hParameters)
        {            
            dijit.byId(sParameter).attr("value", hParameters[sParameter]);
        }
    }
    
    this.GetDialogObject().show(); 
    
    // Select the first element
    var sID = this.m_idDialog;
    Delay(function()
    {
        dijit.selectInputText(dijit.byId(sID)._firstFocusItem.id);
    });
},

// Called when the user clicks ok - override to provide custom handling
OnOK: function(a_hProperties)
{
},

// Called when the user clicks cancel - override to provide custom handling
OnCancel: function()
{
    dijit.byId(this.m_idDialog).hide();
},

m_idDialog: null,
m_hParameters: null

});



////////////////////////////////////////////////////////////////////////////////
// Add Combatant Prompt
////////////////////////////////////////////////////////////////////////////////

dojo.declare("PromptAddCombatant", Prompt, 
{

// Constructs the dialog
constructor: function()
{
    this.SetID("AddCombatantPrompt");
    this.RegisterOK("AddCombatantPromptOK");
    this.RegisterCancel("AddCombatantPromptCancel");
    this.SetupCheckbox("AddCombatantPromptIgnoreInitiative");
    this.SetDefaultParameters(
    {
        AddCombatantPromptURL: "",
        AddCombatantPromptName: "",
        AddCombatantPromptHP: 1,
        AddCombatantPromptIgnoreInitiative: true,
        AddCombatantPromptBaseInitiative: ""
    });
    
    // Set up the events
    dojo.connect(dijit.byId("AddCombatantPromptParse"), "onClick", this, "OnParseClick");  
    dojo.connect(dijit.byId("AddCombatantPromptParse"), "onBlur", this, "OnCancelParse");
    dojo.connect(dijit.byId("AddCombatantPromptIgnoreInitiative"), "onChange", this, "OnModifyIgnoreInitiative");    
    dojo.connect(dijit.byId("AddCombatantPromptBaseInitiative"), "onKeyPress", this, "OnModifyBaseInitiative");  
    dojo.connect(dijit.byId("AddCombatantPromptBaseInitiative"), "onBlur", this, "OnModifyBaseInitiative");     
},

Show: function(a_sURL, a_sName, a_nHP, a_nInitiative)
{
    this.m_bWaitingForParsing = false;    
    dijit.byId("AddCombatantPromptParse").attr("disabled", false);
    dojo.byId("AddCombatantPromptParsingImage").style.visibility = "hidden";
    dojo.byId("AddCombatantPromptParsingRow").style.display = "none";
    Prompt.prototype.Show.call(this,
    {
        AddCombatantPromptURL: a_sURL ? a_sURL : "",
        AddCombatantPromptName: a_sName ? a_sName : "",
        AddCombatantPromptHP: a_nHP ? a_nHP : 1,
        AddCombatantPromptIgnoreInitiative: a_nInitiative == null,
        AddCombatantPromptBaseInitiative: a_nInitiative != null ? a_nInitiative : ""
    });
},

OnOK: function(a_hProperties)
{    
    var nBaseInitiative = a_hProperties.BaseInitiative;
    if (!isNumber(nBaseInitiative))
    {
        nBaseInitiative = null;
    }
    
    CombatantList.Instance.AddCombatant(a_hProperties.URL, a_hProperties.Name, 
        a_hProperties.HP, nBaseInitiative);
                
    this.OnCancelParse();                
},

// Event: called when the user clicks Parse
OnParseClick: function()
{
    // Show the parsing row    
    dojo.byId("AddCombatantPromptParsingRow").style.display = "";

    // Make sure the URL is valid
    var sURL = dijit.byId("AddCombatantPromptURL").attr("value");
    if (!sURL)
    {
        // Change the buttons text
        dojo.byId("AddCombatantPromptParsingText").innerHTML = "Parsing Failed";   
        return;
    }
    
    // Change the buttons text
    dojo.byId("AddCombatantPromptParsingText").innerHTML = "Parsing...";

    // Try to load the page and parse it
    this.m_bWaitingForParsing = true;
    dijit.byId("AddCombatantPromptParse").attr("disabled", true);
    dojo.byId("AddCombatantPromptParsingImage").style.visibility = "visible";
    var oPrompt = this;
    MonsterParser.ParsePage(sURL, 
        function (a_hResult)
        {
            oPrompt.OnParseComplete(a_hResult);
        });
},

// Cancels a parse
OnCancelParse: function()
{
    if (this.m_bWaitingForParsing)
    {
        dojo.byId("AddCombatantPromptParsingText").innerHTML = "Parsing Cancelled";  
    }
    this.m_bWaitingForParsing = false;  
    dijit.byId("AddCombatantPromptParse").attr("disabled", false);
    dojo.byId("AddCombatantPromptParsingImage").style.visibility = "hidden";
},

// Called when parsing of the URL is complete
OnParseComplete: function(a_hResult)
{
    // If we are not waiting for parsing do nothing (probably the user cancelled)
    if (!this.m_bWaitingForParsing)
    {
        return;
    }

    // Check if the parse succeeded
    if (a_hResult == null)
    {
        // Change the buttons text
        dojo.byId("AddCombatantPromptParsingText").innerHTML = "Parsing Failed - Page Not Found";        
    }
    else if (!a_hResult.Name && !a_hResult.HP && !a_hResult.Initiative)
    {
        // Change the buttons text
        dojo.byId("AddCombatantPromptParsingText").innerHTML = dojo.byId("ParseError").innerHTML;
    }
    else
    {
        // Populate the GUI with the parsed values
        if (a_hResult.Name)
        {
            dijit.byId("AddCombatantPromptName").attr("value", a_hResult.Name.trim());
        }
        
        if (a_hResult.HP)
        {
            dijit.byId("AddCombatantPromptHP").attr("value", SafeParseInt(a_hResult.HP));
        }
        
        if (a_hResult.Initiative != null)
        {
            dijit.byId("AddCombatantPromptBaseInitiative").attr("value", SafeParseInt(a_hResult.Initiative));
        }
        
        dijit.byId("AddCombatantPromptIgnoreInitiative").attr("value", false);  
                
        // Change the buttons text
        dojo.byId("AddCombatantPromptParsingText").innerHTML = "Parsing Complete";          
    }
    
    // We are no longer waiting
    this.m_bWaitingForParsing = false; 
    dijit.byId("AddCombatantPromptParse").attr("disabled", false);
    dojo.byId("AddCombatantPromptParsingImage").style.visibility = "hidden";
},

// Event: called when ignore initiative is changed
OnModifyIgnoreInitiative : function (bNewValue)
{
    if (bNewValue)
    {
        dijit.byId("AddCombatantPromptBaseInitiative").attr("value", ""); 
    }
},

// Event: called when base initiative is changed
OnModifyBaseInitiative : function ()
{
    Delay(function()
    {
        if (isNumber(dijit.byId("AddCombatantPromptBaseInitiative").attr("value")))
        {
            dijit.byId("AddCombatantPromptIgnoreInitiative").attr("value", false);         
        }
    });
},

m_bWaitingForParsing: false

});

dojo.addOnLoad(function(){PromptAddCombatant.Instance = new PromptAddCombatant();});




////////////////////////////////////////////////////////////////////////////////
// Edit Combatant Prompt
////////////////////////////////////////////////////////////////////////////////

dojo.declare("PromptEditCombatant", Prompt, 
{

// Constructs the dialog
constructor: function()
{
    this.SetID("EditCombatantPrompt");
    this.RegisterOK("EditCombatantPromptOK");
    this.RegisterCancel("EditCombatantPromptCancel");
    this.SetDefaultParameters(
    {
    });    
},

// Shows the dialog
Show : function (a_cbTarget)
{
    this.m_cbTarget = a_cbTarget;
    Prompt.prototype.Show.call(this, 
    {
        EditCombatantPromptURL: this.m_cbTarget.URL,
        EditCombatantPromptName: this.m_cbTarget.Name,
        EditCombatantPromptBaseInitiative: this.m_cbTarget.BaseInitiative
    });    
},

// Called when the user presses OK
OnOK: function (a_hProperties)
{
    // Update the combatant
    this.m_cbTarget.Name = a_hProperties.Name;
    this.m_cbTarget.BaseInitiative = a_hProperties.BaseInitiative;
    
    // Update the associated page based on the URL change
    if (this.m_cbTarget.URL != a_hProperties.URL)
    {
        this.m_cbTarget.URL = a_hProperties.URL;
        CombatantList.Instance.CreatePage(this.m_cbTarget);
        CombatantList.Instance.OnSelectionChanged();
    }

    // Reflect the changes in the GUI
    CombatantList.Instance.UpdateNodeFromData(this.m_cbTarget); 
},

m_cbTarget: null

});

dojo.addOnLoad(function(){PromptEditCombatant.Instance = new PromptEditCombatant();});





////////////////////////////////////////////////////////////////////////////////
// Duplicate Combatants Prompt
////////////////////////////////////////////////////////////////////////////////

dojo.declare("PromptDuplicateCombatants", Prompt, 
{

// Constructs the dialog
constructor: function()
{
    this.SetID("DuplicateCombatantsPrompt");
    this.RegisterOK("DuplicateCombatantsPromptOK");
    this.RegisterCancel("DuplicateCombatantsPromptCancel");
    this.SetDefaultParameters(
    {
        DuplicateCombatantsPromptCount: 1
    });
},

OnOK: function(a_hProperties)
{    
    CombatantList.Instance.DuplicateSelectedCombatants(a_hProperties.Count);
}

});

dojo.addOnLoad(function(){PromptDuplicateCombatants.Instance = new PromptDuplicateCombatants();});





////////////////////////////////////////////////////////////////////////////////
// Modify HP Prompt
////////////////////////////////////////////////////////////////////////////////

dojo.declare("PromptModifyHP", Prompt, 
{

// Constructs the dialog
constructor: function()
{
    this.SetID("ModifyHPPrompt");
    this.RegisterOK("ModifyHPPromptOK");
    this.RegisterCancel("ModifyHPPromptCancel");

    // Set up the events
    dojo.connect(dijit.byId("ModifyHPPromptDamage"), "onBlur", this, "OnModifyHPPromptDamageUpdate");    
    dojo.connect(dijit.byId("ModifyHPPromptHP"), "onBlur", this, "OnModifyHPPromptHPUpdate");
},

// Shows the dialog
Show: function(a_cbTarget)
{
    this.m_cbTarget = a_cbTarget;
    Prompt.prototype.Show.call(this, 
    {
        ModifyHPPromptHP: this.m_cbTarget.HP,
        ModifyHPPromptDamage: 0
    });    
},

// Event: Called when the damage box is modified
OnModifyHPPromptDamageUpdate: function()
{
    var nValue = dijit.byId("ModifyHPPromptDamage").attr("value");
    
    dijit.byId("ModifyHPPromptHP").attr("value", this.m_cbTarget.HP - nValue);
},

// Event: Called when the HP box is modified
OnModifyHPPromptHPUpdate: function()
{
    var nValue = dijit.byId("ModifyHPPromptHP").attr("value");
    
    dijit.byId("ModifyHPPromptDamage").attr("value", this.m_cbTarget.HP - nValue); 
},

// Event: User clicked ok
OnOK: function(a_hProperties)
{
    this.m_cbTarget.HP = a_hProperties.HP;
    CombatantList.Instance.UpdateNodeFromData(this.m_cbTarget); 
},

// The combatant that is the target of this prompt
m_cbTarget: null
 
});

dojo.addOnLoad(function(){PromptModifyHP.Instance = new PromptModifyHP();});







////////////////////////////////////////////////////////////////////////////////
// Open Combat Prompt
////////////////////////////////////////////////////////////////////////////////

dojo.declare("PromptOpen", Prompt, 
{

// Constructs the dialog
constructor: function()
{
    this.SetID("OpenPrompt");
    this.RegisterOK("OpenPromptOK");
    this.RegisterCancel("OpenPromptCancel");    
    this.SetupCheckbox("OpenPromptMakeDefault");
    this.SetDefaultParameters(
    {
        OpenPromptMakeDefault: false
    });
    this.m_hLastValue = [];
},

// Shows the dialog
Show: function(a_sTitle, a_sLabel, a_sNamespace, a_bShowMakeDefault, a_sOperation)
{
    // Set the title
    this.GetDialogObject().attr("title", a_sTitle);  
    
    // Set the label    
    dojo.byId("OpenPromptLabel").innerHTML = a_sLabel;
    
    // Hide or show make default
    dojo.byId("OpenPromptMakeDefaultRow").style.display = a_bShowMakeDefault ? "inherit" : "none";

    // Update the store
    UpdateSavedCombatStore(a_sNamespace);
    
    // Set the default value
    this.m_hLastValue[this.m_sNamespace] = dijit.byId("OpenPromptCombatName").attr("value");
    var sLastValue = this.m_hLastValue[a_sNamespace];
    if (sLastValue)
    {
        dijit.byId("OpenPromptCombatName").attr("value", sLastValue);
    }
    else
    {
        dijit.byId("OpenPromptCombatName").attr("displayedValue", "");
    }     
    this.m_sNamespace = a_sNamespace;
    
    // Set the operation
    this.m_sOperation = a_sOperation;
    
    // Show the dialog
    Prompt.prototype.Show.call(this); 
},

OnOK: function(a_hProperties)
{    
    if (a_hProperties.CombatName)
    {
        CombatantList.Instance[this.m_sOperation](
            DisplayNameToStorageKey(a_hProperties.CombatName), 
            this.m_sNamespace,
            a_hProperties.MakeDefault == "on");
    }
},

m_sNamespace: "",
m_hLastValue: null,
m_sOperation: ""


});

dojo.addOnLoad(function(){PromptOpen.Instance = new PromptOpen();});





////////////////////////////////////////////////////////////////////////////////
// Save Combat Prompt
////////////////////////////////////////////////////////////////////////////////

dojo.declare("PromptSave", Prompt, 
{

// Constructs the dialog
constructor: function()
{
    this.SetID("SavePrompt");
    this.RegisterOK("SavePromptOK");
    this.RegisterCancel("SavePromptCancel");
    this.SetDefaultParameters(
    {
    });
    this.m_hLastValue = [];
},

// Shows the dialog
Show: function(a_sTitle, a_sLabel, a_sNamespace)
{
    // Set the title
    this.GetDialogObject().attr("title", a_sTitle);  
    
    // Set the label    
    dojo.byId("SavePromptLabel").innerHTML = a_sLabel;

    // Update the store
    UpdateSavedCombatStore(a_sNamespace);
    
    // Set the default value
    this.m_hLastValue[this.m_sNamespace] = dijit.byId("SavePromptCombatName").attr("value");
    var sLastValue = this.m_hLastValue[a_sNamespace];
    if (sLastValue)
    {
        dijit.byId("SavePromptCombatName").attr("value", sLastValue);
    }
    else
    {
        dijit.byId("SavePromptCombatName").attr("displayedValue", "");
    }   
    this.m_sNamespace = a_sNamespace;  
    
    // Show the dialog
    Prompt.prototype.Show.call(this); 
},

OnOK: function(a_hProperties)
{    
    if (ValidateDisplayNameWithPopup(a_hProperties.CombatName))
    {
        CombatantList.Instance.Save(DisplayNameToStorageKey(a_hProperties.CombatName), this.m_sNamespace);
    }
},

m_sNamespace: "",
m_hLastValue: null

});

dojo.addOnLoad(function(){PromptSave.Instance = new PromptSave();});







////////////////////////////////////////////////////////////////////////////////
// Delete Combat Prompt
////////////////////////////////////////////////////////////////////////////////

dojo.declare("PromptDelete", Prompt, 
{

// Constructs the dialog
constructor: function()
{
    this.SetID("DeletePrompt");
    this.RegisterOK("DeletePromptOK");
    this.SetDefaultParameters(
    {
    });
    this.m_hLastValue = [];
    this.m_oMultiSelect = dijit.byId("DeletePromptCombats");
    
    dojo.connect(dijit.byId("DeletePromptDelete"), "onClick", this, "OnDeleteClick");      
},

// Shows the dialog
Show: function(a_sTitle, a_sLabel, a_sNamespace)
{
    // Set the title
    this.GetDialogObject().attr("title", a_sTitle);  
    
    // Set the label    
    dojo.byId("DeletePromptLabel").innerHTML = a_sLabel; 
    
    // Set the namespace
    this.m_sNamespace = a_sNamespace;   
    
    // Update the multiselect
    this.UpdateMultiSelect();
    
    // Show the dialog
    Prompt.prototype.Show.call(this); 
},

// Updates the multiselect with the items in the saved combat store
UpdateMultiSelect: function()
{
    // Update the store
    UpdateSavedCombatStore(this.m_sNamespace);  

    // Clear the multi-select
    DeleteAllChildNodes(this.m_oMultiSelect.containerNode);

    // Populate the multi-select from the store
    for (var iItem = 0; iItem < SavedCombatStoreData.items.length; ++iItem)
    {
        var oItem = SavedCombatStoreData.items[iItem];
        var ndOption = document.createElement("option");
        ndOption.value = oItem.Name;
        ndOption.text = oItem.Name;
        this.m_oMultiSelect.containerNode.appendChild(ndOption);
    }
},

// Called when the user clicks delete
OnDeleteClick: function()
{
    // Get the list of items to delete
    var lstToDelete = this.m_oMultiSelect.getSelected();
    if (lstToDelete.length == 0)
    {
        return;
    }

    // Build the prompt
    var sPrompt = "Are you sure you want to delete the following:";
    for (var iDel = 0; iDel < lstToDelete.length; ++iDel)
    {
        sPrompt += "\r\n";
        sPrompt += lstToDelete[iDel].value;
    }
    
    // Ask if the user actually wants to delete
    if (confirm(sPrompt))
    {
        // Delete the combats
        for (var iDel = 0; iDel < lstToDelete.length; ++iDel)
        {
            dojox.storage.remove(DisplayNameToStorageKey(lstToDelete[iDel].value), this.m_sNamespace);
        }
    
        // Update the multiselect
        this.UpdateMultiSelect();
    }
},

m_sNamespace: "",
m_oMultiSelect: null

});

dojo.addOnLoad(function(){PromptDelete.Instance = new PromptDelete();});













// Store of saved combats
var SavedCombatStoreData =   
{   identifier: 'Name',
    label: 'Name',
    items: []
};

// Updates the saved combat store
function UpdateSavedCombatStore(a_sNamespace)
{
    SavedCombatStoreData.items = [];
    var aSaves = dojox.storage.getKeys(a_sNamespace);
    aSaves.sort();
    for (var iSv = 0; iSv < aSaves.length; ++iSv)
    {
        if (aSaves[iSv].length > 0 &&
            aSaves[iSv].substring(0, 1) != "_")
        {
            SavedCombatStoreData.items.push({Name: StorageKeyToDisplayName(aSaves[iSv])});
        }
    }
    
    SavedCombatStore._getItemsFromLoadedData(SavedCombatStoreData);
}
