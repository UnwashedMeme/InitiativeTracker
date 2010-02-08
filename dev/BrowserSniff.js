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

var BROWSER = 0;
var USER_AGENT = navigator.userAgent.toLowerCase();

var B_Uknown	= 0;
var B_Firefox	= 1;
var B_Mozilla	= 2;
var B_Opera		= 3;
var B_IE		= 4;

if( USER_AGENT.indexOf( "firefox" ) != -1 )
{
	BROWSER = B_Firefox;
}
else if( USER_AGENT.indexOf( "msie" ) != -1 )
{
	BROWSER = B_IE;
}
else if( USER_AGENT.indexOf( "opera" ) != -1 )
{
	BROWSER = B_Opera;
}
else if( USER_AGENT.indexOf( "mozilla" ) != -1 )
{
	BROWSER = B_Mozilla;
}