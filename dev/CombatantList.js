////////////////////////////////////////////////////////////////////////////////
//
//  Combatant List
//
//  Copyright (c) 2009 Jon Thompson
//
////////////////////////////////////////////////////////////////////////////////
//
/// \file CombatantList.js
/// \brief The list of combatants and associated GUI
/// \author Jon Thompson
/// \created January 25, 2009
//
//  Node: a HTML node the represents and object
//  Data: the actual Combatant object
//  Item: the drag n drop list item (rarely used, except as an intermediate)
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

dojo.declare("CombatantList", null, 
{

////////////////////////////////////////////////////////////////////////////////
// Setup
////////////////////////////////////////////////////////////////////////////////


// Initializes the list with GUI components
Initialize: function(a_sListID, a_sPagesID, a_sNotesID)
{
    // Connect to the GUI components
    CombatantList.Instance.GUIList = new dojo.dnd.Source(a_sListID);
    CombatantList.Instance.PagesList = dijit.byId(a_sPagesID);
    CombatantList.Instance.NotesList = dijit.byId(a_sNotesID);
    
    // Connect events
    dojo.connect(dojo.byId("Combatants"), "onclick", this, "OnSelectionChanged");
    dojo.connect(CombatantList.Instance.GUIList, "onDropInternal", this, "OnDropInternal");  
},

////////////////////////////////////////////////////////////////////////////////
// Basic Accessors
////////////////////////////////////////////////////////////////////////////////

// Gets the numbers of items in the list
GetCount: function()
{
    return this.GUIList.getAllNodes().length;
},

// Get the index of a particular node in the list
GetIndexOfNode : function(a_ndNode)
{
    var lstNodes = this.GUIList.getAllNodes();
    for (var i = 0; i < lstNodes.length; ++i)
    {
        if (lstNodes[i] == a_ndNode)
        {
            return i;
        }
    }
    
    return -1;
},

// Gets an item by the node index
GetItemByIndex : function (a_nIndex)
{
    var ndNode = this.GetNodeByIndex(a_nIndex);
    if (ndNode == null)
    {
        return null;
    }
    
    return this.GetItemByNode(ndNode);
},

// Gets the item associated with a node
GetItemByNode : function(a_ndNode)
{
    return this.GUIList.getItem(a_ndNode.id);
},

// Gets the node associated with an item
GetNodeByItem : function(a_it)
{
    var lstNodes = this.GUIList.getAllNodes();
    for (var i = 0; i < lstNodes.length; ++i)
    {
        if (this.GetItemByNode(lstNodes[i]) == a_it)
        {
            return lstNodes[i];
        }
    }
    
    return null;    
},

// Gets the data associated with a node
GetDataByNode : function(a_ndNode)
{
    var itItem = this.GetItemByNode(a_ndNode);
    if (itItem != null)
    {
        return itItem.data;
    }
    
    return null;
},

// Gets the node associated with a data object
GetNodeByData : function(a_dt)
{
    var lstNodes = this.GUIList.getAllNodes();
    for (var i = 0; i < lstNodes.length; ++i)
    {
        if (this.GetDataByNode(lstNodes[i]) == a_dt)
        {
            return lstNodes[i];
        }
    }
    
    return null;    
},


// Gets the node at a particular index
GetNodeByIndex : function (a_nIndex)
{
    return this.GUIList.getAllNodes()[a_nIndex];
},

// Gets the data at a particular index
GetDataByIndex : function (a_nIndex)
{
    return this.GetDataByNode(this.GetNodeByIndex(a_nIndex));
},

// Gets a data object by its unique ID
GetDataByUniqueID : function (a_nUniqueID)
{
    var dtResult = null;
    
    this.GUIList.forInItems(function (a_it, a_id, a_map)
    {
        if (a_it.data.UniqueID == a_nUniqueID)
        {
            dtResult = a_it.data;
        }
    }, this.GUIList);
    
    return dtResult;
},

// Gets all of the data objects
GetAllData : function ()
{
    var aData = [];
    var aNodes = this.GUIList.getAllNodes();
    for (var iNd = 0; iNd < aNodes.length; ++iNd)
    {
        aData.push(this.GetDataByNode(aNodes[iNd]));
    }
    
    return aData;
}, 

// Updates the node from the item
UpdateNodeFromData : function(a_dtData)
{
    nd = this.GetNodeByData(a_dtData);
    if (nd != null)
    {
        nd.innerHTML = a_dtData.toString();        
    }
},

// Updates the dead status of the node
UpdateDeadStatus : function (a_nd, a_bDead)
{
    var lstCells = a_nd.getElementsByTagName("td");
    for (var iCell = 0; iCell < lstCells.length; ++iCell)
    {
        if (a_bDead)
        {
            dojo.addClass(lstCells[iCell], "Dead");
        }
        else
        {
            dojo.removeClass(lstCells[iCell], "Dead");
        }
    }
},

////////////////////////////////////////////////////////////////////////////////
// Add & Remove Combatants
////////////////////////////////////////////////////////////////////////////////

// Adds a new combatant
AddCombatant : function(a_sURL, a_sName, a_nHP, a_nBaseInitiative, a_nInitiative, a_bIgnoreOrder)
{
    // If no initiative is passed in then chose the lowest initiative
    if (a_nBaseInitiative == null)
    {
        a_nBaseInitiative = this.GetLowestInitiative() - 1;
        a_nInitiative = a_nBaseInitiative;
    }
    
    if (a_nInitiative == null)
    {
        a_nInitiative = a_nBaseInitiative + d20();
    }

    var cbNewCombatant = new Combatant (a_sURL, a_sName, a_nHP, a_nBaseInitiative, a_nInitiative);
    this.AddCombatantInternal(cbNewCombatant, a_bIgnoreOrder);
    
    return cbNewCombatant;
},

AddCombatantInternal : function(a_cbNew, a_bIgnoreOrder)
{      
    // Create the button 
    if (a_bIgnoreOrder)
    {
        this.GUIList.insertNodes(false, [a_cbNew]);
    }
    else
    {   
        var ndNodeBefore = this.GetNodeBeforeInitiative(a_cbNew);
        if (ndNodeBefore)
        {
            this.GUIList.insertNodes(false, [a_cbNew], false, ndNodeBefore);
        }
        else
        {
            this.GUIList.insertNodes(false, [a_cbNew], true, null);
        }
    }

    // Create the page
    this.CreatePage(a_cbNew);
    
    // Create the notes
    a_cbNew.Notes = new dijit.Editor({plugins: TOOLBAR_PLUGINS});
    this.NotesList.addChild(a_cbNew.Notes);    
    
    // Make sure the initiatives are all valid
    if (!a_bIgnoreOrder)
    {    
        this.EnsureValidInitiatives();
    }
},

CreatePage : function (a_cbTarget)
{
    // Check if the page already exists  
    if (!a_cbTarget.URL)
    {
        // Create an editor
        a_cbTarget.Page = new dijit.Editor({plugins: TOOLBAR_PLUGINS});
        this.PagesList.addChild(a_cbTarget.Page);
    } 
    else if (this.Pages[a_cbTarget.URL] == null)
    {    
        // Create the page        
        var nUniqueID = GetUniqueID();
        a_cbTarget.Page = new dijit.layout.ContentPane();
        a_cbTarget.Page.attr("content", "<iframe id='DisplayIframe" + nUniqueID + "' height='100%' width='100%'></iframe>");
        a_cbTarget.Page.title = a_cbTarget.Name;
        this.Pages[a_cbTarget.URL] = a_cbTarget.Page;
        this.PagesList.addChild(a_cbTarget.Page);
        
        // This delayed setting of the URL is a workaround to make sure that the
        // frame ACTUALLY loads the right page, instead of grabbing some other
        // page from the same server
        Delay (function()
        {
            dojo.byId("DisplayIframe" + nUniqueID).src = a_cbTarget.URL;
        });
    }
    else
    {
        // Use the existing page       
        a_cbTarget.Page = this.Pages[a_cbTarget.URL];
    }    
},

// Duplicates the combatant passed in
DuplicateCombatant: function (a_cbSource)
{
    var cbNew = a_cbSource.Duplicate();
    this.AddCombatantInternal(cbNew);
    cbNew.Notes.setValue(a_cbSource.Notes.getValue(false));
    if (!cbNew.URL)
    {
        cbNew.Page.setValue(a_cbSource.Page.getValue(false));
    }
},

// Duplicates the selected combatants
DuplicateSelectedCombatants : function(a_nCount)
{   
    // Duplicate each selected combatant
    
    for (var iCount = 0; iCount < a_nCount; ++iCount)
    {
        var aSelected = this.GetSelectedCombatants();
        for (var iItem = 0; iItem < aSelected.length; ++iItem)
        {
            this.DuplicateCombatant(aSelected[iItem]);
        }
    }
},

// Removes the selected combatants
RemoveSelectedCombatants : function()
{
    if (confirm("Are you sure you want to delete the selected node(s)?"))
    {
        this.GUIList.deleteSelectedNodes();    
    }
},

// Edits the selected combatant
EditSelectedCombatant : function ()
{
    var lstSelected = this.GetSelectedCombatants();
    if (lstSelected.length != 1)
    {
        alert("You must have exactly 1 combatant selected.");
        return;
    }
    
    PromptEditCombatant.Instance.Show(lstSelected[0]);    
},

// Clears all combatants from the list
Clear : function()
{
    var aNodes = this.GUIList.getAllNodes();    
    for (var iNode = 0; iNode < aNodes.length; ++iNode)
    {	
        dojo._destroyElement(aNodes[iNode].id);
    }
    this.GUIList.clearItems();
},

////////////////////////////////////////////////////////////////////////////////
// GUI Functions
////////////////////////////////////////////////////////////////////////////////

// Selects a particular item
SelectNode : function(a_nd, a_bExclusive)
{
    if (a_bExclusive)
    {
        this.GUIList.selectNone();
    }
    
    if (a_nd)
    {
        this.GUIList._addItemClass(dojo.byId(a_nd.id), "Selected");
        this.GUIList.selection[a_nd.id]=1;
    }
    
    this.OnSelectionChanged();
},

// Gets the list of selected combatants
GetSelectedCombatants : function()
{
    var aSelectedCombatants = [];
    for (var id in this.GUIList.selection)
    {
        if (id in dojo.dnd._empty)
        {
            continue;
        }
               
        aSelectedCombatants.push(this.GUIList.getItem(id).data);
    }  
    
    return aSelectedCombatants;
},

// Checks if nothing is selected
IsSelectionEmpty : function()
{
    return this.GetSelectedCombatants().length == 0;
},

// Highlights the HP to show that it is clickable
HighlightHP : function (a_nCombatantID, a_bHighlight)
{    
    var oHP = dojo.byId("CombatantHP" + a_nCombatantID);
    if (oHP)
    {
        if (a_bHighlight)
        {
            dojo.addClass(oHP, "HPHover");
        }
        else
        {
            dojo.removeClass(oHP, "HPHover");
        }
    }
},

////////////////////////////////////////////////////////////////////////////////
// Initiative
////////////////////////////////////////////////////////////////////////////////

// Get the current initiative index
GetCurrentInitiativeIndex : function()
{
    // Loop throught the nodes looking for an item marked as current
    var aNodes = this.GUIList.getAllNodes();    
    for (var iNode = 0; iNode < aNodes.length; ++iNode)
    {
        if (dojo.hasClass(aNodes[iNode], "CurrentInitiativeItem"))
        {
            return iNode;
        }
    }
    
    // None found
    return -1;
},

// Get the current initiative node
GetCurrentInitiativeNode : function()
{
    // Loop throught the nodes looking for an item markes as current
    var aNodes = this.GUIList.getAllNodes();    
    for (var iNode = 0; iNode < aNodes.length; ++iNode)
    {
        if (dojo.hasClass(aNodes[iNode], "CurrentInitiativeItem"))
        {
            return aNodes[iNode];
        }
    }
    
    // None found
    return null;
},

// Get the current initiative data
GetCurrentInitiativeData : function()
{
    var nd = this.GetCurrentInitiativeNode();
    if (nd == null)
    {
        return null;
    }
    
    return this.GetDataByNode(nd);
},

// Set the current iniative item index
SetCurrentInitiativeIndex : function(a_nIndex)
{
    var aNodes = this.GUIList.getAllNodes();
    
    // Make sure the index is in range
    if (a_nIndex > aNodes.length)
    {
        a_nIndex = -1;
    }
    
    // Loop through and mark the nodes accordingly
    for (var iNode in aNodes)
    {
        if (iNode == a_nIndex)
        {
            dojo.addClass(aNodes[iNode], "CurrentInitiativeItem");
        }
        else
        {
            dojo.removeClass(aNodes[iNode], "CurrentInitiativeItem");
        }
    }
},

// Selects the current initiative item
SelectCurrentInitiativeItem : function()
{
    this.SelectNode(this.GetCurrentInitiativeNode(), true);
},

// Advance the initiative
AdvanceInitiative : function()
{
    // Remember the initiative we started at to avoid an infinite loop
    var nStartingInit = this.GetCurrentInitiativeIndex();
    var nNewInit = 0; 

    // Loop until we find a valid combatant
    for (nNewInit = nStartingInit + 1; nNewInit != nStartingInit; ++nNewInit)
    {
        // Increment the initiative, wrapping around to 0, if we go over
        if (nNewInit >= this.GetCount() || nNewInit < 0)
        {
            nNewInit = 0;
        }
        
        // As long the the new combatant is not dead, we are done
        if (this.GetDataByIndex(nNewInit).HP > 0)
        {
            break;
        }  
    }

    // Set the initiative
    this.SetCurrentInitiativeIndex(nNewInit);
    
    // Select the current initiative item
    this.SelectCurrentInitiativeItem();    
},

// Recalculates initiative for a subset of the list of nodes
RecalculateInitiative : function (a_nStart, a_nEnd)
{
    // Determine
    var nInitBefore = 0;
    if (a_nStart > 0)
    {
        nInitBefore = this.GetDataByIndex(a_nStart-1).Initiative;
    }
    else
    {
        nInitBefore = this.GetHighestInitiative() + 2;
    }
    
    var nInitAfter = 0;
    if (a_nEnd < this.GetCount())
    {
        nInitAfter = this.GetDataByIndex(a_nEnd).Initiative;
    }
    else
    {
        nInitAfter = this.GetLowestInitiative() - 2;
    }
    
    var nIncrement = (nInitAfter - nInitBefore) / (a_nEnd - a_nStart + 1);
    var nNextInit = nInitBefore + nIncrement;        

    // Loop through and assign new initiatives
    for (var iNd = a_nStart; iNd < a_nEnd; ++iNd)
    {
        // Update the initiative, while keeping the old to compare with
        var dtCurrent = this.GetDataByIndex(iNd);
        var nOldInitiative = dtCurrent.Initiative;
        dtCurrent.Initiative = nNextInit;
        
        // If we are debugging initiative we need to upadate the display
        if (!!_DEBUG_INITIATIVE)
        {
            this.UpdateNodeFromData(dtCurrent);
        }
        
        // Increment the initiative
        // Don't increment if the next data has the same initiative as this one
        // That way they will have the same new initiative after this operation too
        if (iNd + 1 < a_nEnd)
        {
            var dtNext = this.GetDataByIndex(iNd + 1);
            if (dtNext.Initiative != nOldInitiative)
            {        
                nNextInit += nIncrement;   
            }
        }
    }  
    
},

EnsureValidInitiatives : function()
{
    // If there are no items, there is nothing to do
    if (this.GetCount() == 0)
    {
        return;
    }
    
    var nPreviousInit = this.GetDataByIndex(0).Initiative + 1000;
    var nStartOfBadness = null;
    
    // Loop through all data
    for (var iDt = 0; iDt < this.GetCount(); ++iDt)
    {
        var dtCurrent = this.GetDataByIndex(iDt);
        
        // If our initiative is higher than the previous items, then
        // there is a problem
        if (dtCurrent.Initiative > nPreviousInit)
        {
            // Something is wrong here, if nothing was already wrong, start the
            // counting here
            if (nStartOfBadness == null)
            {
                nStartOfBadness = iDt;
            }
        }
        else
        {
            // If there was some badness going on, deal with it            
            if (nStartOfBadness != null)
            {
                this.RecalculateInitiative(nStartOfBadness, iDt);
            }
            
            // Prepare for the next loop
            nStartOfBadness = null;
            nPreviousInit = dtCurrent.Initiative;
        }        
    }
    
    // Handle any final badness
    if (nStartOfBadness != null)
    {
        this.RecalculateInitiative(nStartOfBadness, this.GetCount());
    }
},

// Find the lowest init in the list
GetLowestInitiative : function ()
{
    if (this.GetCount() == 0)
    {
        return 0;
    }

    var nResult = this.GetDataByIndex(0).Initiative;
    this.GUIList.forInItems(function (a_it, a_id, a_map)
    {
        if (a_it.data.Initiative < nResult)
        {
            nResult = a_it.data.Initiative;
        }
    }, this.GUIList);
    
    return nResult;
},

// Find the highest init in the list
GetHighestInitiative : function ()
{
    if (this.GetCount() == 0)
    {
        return 0;
    }
    
    var nResult = this.GetDataByIndex(0).Initiative;
    this.GUIList.forInItems(function (a_it, a_id, a_map)
    {
        if (a_it.data.Initiative > nResult)
        {
            nResult = a_it.data.Initiative;
        }
    }, this.GUIList);
    
    return nResult;
},

// Gets the node before a certain initiative
GetNodeBeforeInitiative : function (a_cbNew)
{   
    if (this.GetCount() == 0)
    {
        return 0;
    }

    var dtBefore = null;
    var aData = this.GetAllData();
    for (var iDt = 0; iDt < aData.length; ++iDt)
    {
        var dtCur = aData[iDt];
    
        if (dtCur.CompareInitiative(a_cbNew) >= 0)
        {
            dtBefore = dtCur;
        }
    }
        
    if (!dtBefore)
    {
        return null;
    }
    
    return this.GetNodeByData(dtBefore);
},

////////////////////////////////////////////////////////////////////////////////
// Save & Load
////////////////////////////////////////////////////////////////////////////////


// Serializes this object
Serialize : function ()
{
    this.EnsureValidInitiatives();   
    
    var oSerialized = 
    {
        CurrentInitiativeIndex: this.GetCurrentInitiativeIndex(),
        Combatants: []
    };
    
    var aData = this.GetAllData();
    for (var iDt = 0; iDt < aData.length; ++iDt)
    {
        // Serialize the combatant
        var dtData = aData[iDt];
        var oCombatant = dtData.Serialize();
                
        // Add the object to the list
        oSerialized.Combatants.push(oCombatant);
    }
    
    return oSerialized;
},

// De-serializes this object
DeSerialize : function (a_oSerialized)
{
    this.Clear();
    
    for (var iDt = 0; iDt < a_oSerialized.Combatants.length; ++iDt)
    {
        var oData = a_oSerialized.Combatants[iDt];
        var cbCombatant = this.AddCombatant(oData.URL, oData.Name, oData.HP, oData.BaseInitiative, oData.Initiative, true);
        
        // Set the page text
        if (!cbCombatant.URL && oData.PageText)
        {
            cbCombatant.Page.setValue(oData.PageText);
        }
        
        // Set the notes text
        cbCombatant.Notes.setValue(oData.NotesText);
    }    
    
    // Set the current initiative
    this.SetCurrentInitiativeIndex(a_oSerialized.CurrentInitiativeIndex);
    this.SelectCurrentInitiativeItem();    
        
    this.EnsureValidInitiatives();
},

// Saves the combatant list
Save : function (a_sKey, a_sNamespace)
{
    dojox.storage.put(a_sKey, this.Serialize(), null, a_sNamespace);
},

// Loads the combatant list
Load : function (a_sKey, a_sNamespace)
{
    var oValue = dojox.storage.get(a_sKey, a_sNamespace);    
    if (oValue)
    {
        this.DeSerialize(oValue);
    }
},

// Starts a new combat
NewCombat : function ()
{
    if (confirm("Are you sure you want to start a new combat?"))
    {
        this.Clear();
    }
},

////////////////////////////////////////////////////////////////////////////////
// Players
////////////////////////////////////////////////////////////////////////////////

// Adds saved players to the combat
AddPlayers: function (a_sKey, a_sNamespace, a_bMakeDefault)
{
    // Load the players from storage
    var oValue = dojox.storage.get(a_sKey, a_sNamespace);    
    if (oValue)
    {    
        // Get each initiative
        for (var iDt = 0; iDt < oValue.Combatants.length; ++iDt)
        {
            var oData = oValue.Combatants[iDt]; 
            oData.Initiative = oData.BaseInitiative + d20();
            
            // Read an initiative from the user
            while (true)
            {     
                // Prompt the user for an initiative
                var sResult = prompt (oData.Name, oData.Initiative);
                
                // If the user hit cancel (sResult is null) then abort the whole add
                if (sResult == null)
                {
                    return;
                }
                
                // Make sure the value is valid
                var nInitiative = parseInt(sResult, 10);
                if (isNaN(nInitiative))
                {
                    alert ("\"" + sResult + "\" is not a valid number.");
                }
                else
                {                                    
                    // Use the initiative specified          
                    oData.Initiative = nInitiative;  
                    break;
                }
            }
                          
        }   
        
        // Actually add the players
        for (var iDt = 0; iDt < oValue.Combatants.length; ++iDt)
        {
            var oData = oValue.Combatants[iDt]; 
            var cbCombatant = this.AddCombatant(oData.URL, oData.Name, oData.HP, oData.BaseInitiative, oData.Initiative);
                        
            if (!cbCombatant.URL && oData.PageText)
            {
                cbCombatant.Page.setValue(oData.PageText);
            }
        }   
    }
        
    // Make sure we are in a valid state
    this.EnsureValidInitiatives();    
    
    // Save if this is the new default    
    if (a_bMakeDefault)
    {
        dojox.storage.put("DefaultPlayersKey", a_sKey);   
        dojox.storage.put("DefaultPlayersNamespace", a_sNamespace);     
    }
},

// Adds the default players
AddDefaultPlayers: function ()
{
    var sKey = dojox.storage.get("DefaultPlayersKey");
    var sNamespace = dojox.storage.get("DefaultPlayersNamespace");
    
    if (sKey && sNamespace)
    {
        this.AddPlayers(sKey, sNamespace, false);  
    }
},

////////////////////////////////////////////////////////////////////////////////
// Event Handlers
////////////////////////////////////////////////////////////////////////////////

// Event: Called when the user drags and drops
OnDropInternal : function(a_lstNodes, a_bCopy)
{
    // Remember the current initiative
    var dtCurrentInit = this.GetCurrentInitiativeData();
    var nCurrentInitiative = null;
    if (dtCurrentInit != null)
    {
        nCurrentInitiative = dtCurrentInit.Initiative;
    }    

    // Get the index of the first node dropped (its new index)
    var nFirstIndex = this.GetIndexOfNode(a_lstNodes[0]);
    
    // All the nodes will get dropped together, so we can thus extrapolate the 
    // index of the first node after the list
    var nFollowingIndex = nFirstIndex + a_lstNodes.length;

    // Recalculate the initiative for these items
    
    this.RecalculateInitiative(nFirstIndex, nFollowingIndex);  
    
    // Select an new current initiative item
    
    if (nCurrentInitiative != null)
    {
        // First check if the old current object matches
        // If they match, then do nothing
        if (dtCurrentInit.Initiative != nCurrentInitiative)
        {
            // The current initiative item changed its initiative
            // We must select the item with the first initiative equal
            // or less than the current initiative
            
            var bChanged = false;
            for (var iDt = 0; iDt < this.GetCount(); ++iDt)
            {
                var dtCur = this.GetDataByIndex(iDt);
                if (dtCur.Initiative <= nCurrentInitiative)
                {
                    this.SetCurrentInitiativeIndex(iDt);
                    bChanged = true;
                    break;
                }
            }
            
            // If we didn't change that means we didn't find something lower,
            // so go back to the top
            if (!bChanged)
            {
                this.SetCurrentInitiativeIndex(0);
            }
        }
    }
},

// Event: Called when the selection changed
OnSelectionChanged : function()
{
    for (var id in this.GUIList.selection)
    {
        if (id in dojo.dnd._empty)
        {
            continue;
        }
                
        var cbSelected = this.GUIList.getItem(id).data;
        this.PagesList.selectChild(cbSelected.Page);
        this.NotesList.selectChild(cbSelected.Notes);
        
        if(!cbSelected.URL)
        {
            cbSelected.Page.onNormalizedDisplayChanged();
        }        
        cbSelected.Notes.onNormalizedDisplayChanged();
        break;
    }       
},

// Event: When the user clicks HP
OnClickHP : function (a_nUniqueID)
{
    var cbClicked = this.GetDataByUniqueID(a_nUniqueID);
    if (cbClicked != null)
    {
        PromptModifyHP.Instance.Show(cbClicked);  
    }
},


// Instance Variables
Pages: [],
GUIList: null,
PagesList: null,
NotesList: null

});

CombatantList.Instance = new CombatantList();
