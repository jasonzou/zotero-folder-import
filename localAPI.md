# Zotero Local API Endpoints

This document provides a comprehensive reference for the Zotero Local API endpoints available in the Zotero desktop application.

**Base URL:** `http://localhost:23119/api`

## Authentication

The Zotero local API does not require authentication when accessed from the local machine. 
**Notice**: The rest api won't work if you access via a brower. Use command line ```curl -XGET http://localhost:23119/api/xxx``` instead.

## Endpoints

### itemTypes
- GET /itemTypes

### itemTypeFields
- GET /itemTypeFields
  - parameter: itemType

### itemTypeCreatorTypes
- GET /itemTypeCreatorTypes
  - parameter: itemType

### creatorFields
- GET /creatorFields



### itemFields
- GET /itemFields

### Schema
- GET /schema

Zotero.Server.Endpoints["/api/users/:userID/settings"] = Zotero.Server.LocalAPI.Settings;


Zotero.Server.LocalAPI.Collections = class extends LocalAPIEndpoint {
	supportedMethods = ['GET'];
	
	run({ pathname, pathParams, libraryID }) {
		let top = pathname.endsWith('/top');
		let collections = pathParams.collectionKey
			? Zotero.Collections.getByParent(Zotero.Collections.getIDFromLibraryAndKey(libraryID, pathParams.collectionKey))
			: Zotero.Collections.getByLibrary(libraryID, !top);
		return { data: collections };
	}
};
Zotero.Server.Endpoints["/api/users/:userID/collections"] = Zotero.Server.LocalAPI.Collections;
Zotero.Server.Endpoints["/api/groups/:groupID/collections"] = Zotero.Server.LocalAPI.Collections;
Zotero.Server.Endpoints["/api/users/:userID/collections/top"] = Zotero.Server.LocalAPI.Collections;
Zotero.Server.Endpoints["/api/groups/:groupID/collections/top"] = Zotero.Server.LocalAPI.Collections;
Zotero.Server.Endpoints["/api/users/:userID/collections/:collectionKey/collections"] = Zotero.Server.LocalAPI.Collections;
Zotero.Server.Endpoints["/api/groups/:groupID/collections/:collectionKey/collections"] = Zotero.Server.LocalAPI.Collections;

Zotero.Server.LocalAPI.Collection = class extends LocalAPIEndpoint {
	supportedMethods = ['GET'];

	run({ pathParams, libraryID }) {
		let collection = Zotero.Collections.getByLibraryAndKey(libraryID, pathParams.collectionKey);
		if (!collection) return _404;
		return { data: collection };
	}
};
Zotero.Server.Endpoints["/api/users/:userID/collections/:collectionKey"] = Zotero.Server.LocalAPI.Collection;
Zotero.Server.Endpoints["/api/groups/:groupID/collections/:collectionKey"] = Zotero.Server.LocalAPI.Collection;

Zotero.Server.Endpoints["/api/users/:userID/groups"] = Zotero.Server.LocalAPI.Groups;

Zotero.Server.LocalAPI.Group = class extends LocalAPIEndpoint {
	supportedMethods = ['GET'];

	run({ pathParams }) {
		let group = Zotero.Groups.get(pathParams.groupID);
		if (!group) return _404;
		return { data: group };
	}
};
Zotero.Server.Endpoints["/api/groups/:groupID"] = Zotero.Server.LocalAPI.Group;
Zotero.Server.Endpoints["/api/users/:userID/groups/:groupID"] = Zotero.Server.LocalAPI.Group;


### 1. Items

#### Get Items
- **Endpoint:** `GET /items`
- **Description:** Retrieve items from a library
- **Query Parameters:**
  - `libraryType` (string): Type of library ('user' or 'group')
  - `libraryID` (number): ID of the library
  - `itemType` (string, optional): Filter by item type
  - `collectionKey` (string, optional): Filter by collection
  - `q` (string, optional): Search query
- **Response:** Array of item objects

Zotero.Server.Endpoints["/api/users/:userID/items/:itemKey/children"] = Zotero.Server.LocalAPI.Items;
Zotero.Server.Endpoints["/api/groups/:groupID/items/:itemKey/children"] = Zotero.Server.LocalAPI.Items;
Zotero.Server.Endpoints["/api/users/:userID/publications/items"] = Zotero.Server.LocalAPI.Items;
Zotero.Server.Endpoints["/api/users/:userID/publications/items/top"] = Zotero.Server.LocalAPI.Items;
Zotero.Server.Endpoints["/api/users/:userID/publications/items/tags"] = Zotero.Server.LocalAPI.Items;
Zotero.Server.Endpoints["/api/users/:userID/searches/:searchKey/items"] = Zotero.Server.LocalAPI.Items;
Zotero.Server.Endpoints["/api/groups/:groupID/searches/:searchKey/items"] = Zotero.Server.LocalAPI.Items;

Zotero.Server.LocalAPI.Item = class extends LocalAPIEndpoint {
	supportedMethods = ['GET'];

	async run({ pathParams, libraryID }) {
		let item = await Zotero.Items.getByLibraryAndKeyAsync(libraryID, pathParams.itemKey);
		if (!item) return _404;
		return { data: item };
	}
};
Zotero.Server.Endpoints["/api/users/:userID/items/:itemKey"] = Zotero.Server.LocalAPI.Item;
Zotero.Server.Endpoints["/api/groups/:groupID/items/:itemKey"] = Zotero.Server.LocalAPI.Item;


Zotero.Server.LocalAPI.ItemFile = class extends LocalAPIEndpoint {
	supportedMethods = ['GET'];

	async run({ pathname, pathParams, libraryID }) {
		let item = await Zotero.Items.getByLibraryAndKeyAsync(libraryID, pathParams.itemKey);
		if (!item) return _404;
		if (!item.isFileAttachment()) {
			return [400, 'text/plain', `Not a file attachment: ${item.key}`];
		}
		if (pathname.endsWith('/url')) {
			return [200, 'text/plain', item.getLocalFileURL()];
		}
		return [302, { 'Location': item.getLocalFileURL() }, ''];
	}
};
Zotero.Server.Endpoints["/api/users/:userID/items/:itemKey/file"] = Zotero.Server.LocalAPI.ItemFile;
Zotero.Server.Endpoints["/api/groups/:groupID/items/:itemKey/file"] = Zotero.Server.LocalAPI.ItemFile;
Zotero.Server.Endpoints["/api/users/:userID/items/:itemKey/file/view"] = Zotero.Server.LocalAPI.ItemFile;
Zotero.Server.Endpoints["/api/groups/:groupID/items/:itemKey/file/view"] = Zotero.Server.LocalAPI.ItemFile;
Zotero.Server.Endpoints["/api/users/:userID/items/:itemKey/file/view/url"] = Zotero.Server.LocalAPI.ItemFile;
Zotero.Server.Endpoints["/api/groups/:groupID/items/:itemKey/file/view/url"] = Zotero.Server.LocalAPI.ItemFile;


Zotero.Server.LocalAPI.ItemFullText = class extends LocalAPIEndpoint {
	supportedMethods = ['GET'];

	async run({ pathParams, libraryID }) {
		let item = await Zotero.Items.getByLibraryAndKeyAsync(libraryID, pathParams.itemKey);
		if (!item || !item.isFileAttachment() || !Zotero.Fulltext.isCachedMIMEType(item.attachmentContentType)) {
			return _404;
		}
		let file = Zotero.Fulltext.getItemCacheFile(item);
		if (!file.exists()) {
			return _404;
		}
		let { indexedPages, totalPages, indexedChars, totalChars, version } = await Zotero.DB.rowQueryAsync(
			"SELECT indexedPages, totalPages, indexedChars, totalChars, version FROM fulltextItems WHERE itemID=?",
			item.id
		);
		return [
			200,
			{
				'Content-Type': 'application/json',
				'Last-Modified-Version': version,
			},
			JSON.stringify(
				{
					content: await Zotero.File.getContentsAsync(file),
					indexedPages: indexedPages ?? undefined,
					totalPages: totalPages ?? undefined,
					indexedChars: indexedChars ?? undefined,
					totalChars: totalChars ?? undefined,
				},
				null,
				4
			)
		];
	}
};
Zotero.Server.Endpoints["/api/users/:userID/items/:itemKey/fulltext"] = Zotero.Server.LocalAPI.ItemFullText;
Zotero.Server.Endpoints["/api/groups/:groupID/items/:itemKey/fulltext"] = Zotero.Server.LocalAPI.ItemFullText;


Zotero.Server.LocalAPI.FullText = class extends LocalAPIEndpoint {
	supportedMethods = ['GET'];

	async run({ searchParams, libraryID }) {
		let since = parseInt(searchParams.get('since'));
		if (Number.isNaN(since)) {
			return [400, 'text/plain', `Invalid 'since' value '${searchParams.get('since')}'`];
		}
		let rows = await Zotero.DB.queryAsync(
			"SELECT I.key, FI.version "
				+ "FROM fulltextItems FI JOIN items I USING (itemID) "
				+ "WHERE libraryID=?1 AND (?2=0 OR FI.version>?2)",
			[libraryID, since]
		);
		let obj = {};
		for (let row of rows) {
			obj[row.key] = row.version;
		}
		return [200, 'application/json', JSON.stringify(obj, null, 4)];
	}
};
Zotero.Server.Endpoints["/api/users/:userID/fulltext"] = Zotero.Server.LocalAPI.FullText;
Zotero.Server.Endpoints["/api/groups/:groupID/fulltext"] = Zotero.Server.LocalAPI.FullText;


Zotero.Server.LocalAPI.Searches = class extends LocalAPIEndpoint {
	supportedMethods = ['GET'];

	async run({ libraryID }) {
		let searches = await Zotero.Searches.getAll(libraryID);
		return { data: searches };
	}
};
Zotero.Server.Endpoints["/api/users/:userID/searches"] = Zotero.Server.LocalAPI.Searches;
Zotero.Server.Endpoints["/api/groups/:groupID/searches"] = Zotero.Server.LocalAPI.Searches;

Zotero.Server.LocalAPI.Search = class extends LocalAPIEndpoint {
	supportedMethods = ['GET'];

	async run({ pathParams, libraryID }) {
		let search = Zotero.Searches.getByLibraryAndKey(libraryID, pathParams.searchKey);
		if (!search) return _404;
		return { data: search };
	}
};
Zotero.Server.Endpoints["/api/users/:userID/searches/:searchKey"] = Zotero.Server.LocalAPI.Search;
Zotero.Server.Endpoints["/api/groups/:groupID/searches/:searchKey"] = Zotero.Server.LocalAPI.Search;


Zotero.Server.LocalAPI.Tags = class extends LocalAPIEndpoint {
	supportedMethods = ['GET'];

	async run({ libraryID }) {
		let tags = await Zotero.Tags.getAll(libraryID);
		let json = await Zotero.Tags.toResponseJSON(libraryID, tags);
		return { data: json };
	}
};
Zotero.Server.Endpoints["/api/users/:userID/tags"] = Zotero.Server.LocalAPI.Tags;
Zotero.Server.Endpoints["/api/groups/:groupID/tags"] = Zotero.Server.LocalAPI.Tags;

Zotero.Server.LocalAPI.Tag = class extends LocalAPIEndpoint {
	supportedMethods = ['GET'];

	async run({ pathParams, libraryID }) {
		let tag = decodeURIComponent(pathParams.tag.replaceAll('+', '%20'));
		let json = await Zotero.Tags.toResponseJSON(libraryID, [{ tag }]);
		if (!json) return _404;
		return { data: json };
	}
};
Zotero.Server.Endpoints["/api/users/:userID/tags/:tag"] = Zotero.Server.LocalAPI.Tag;
Zotero.Server.Endpoints["/api/groups/:groupID/tags/:tag"] = Zotero.Server.LocalAPI.Tag;


/**
 * Convert a {@link Zotero.DataObject}, or an array of DataObjects, to response JSON
 * 		with appropriate included data based on the 'include' query parameter.
 *
 * @param {Zotero.DataObject | Zotero.DataObject[]} dataObjectOrObjects
 * @param {URLSearchParams} searchParams
 * @returns {Promise<Object>}
 */
async function toResponseJSON(dataObjectOrObjects, searchParams) {
	if (Array.isArray(dataObjectOrObjects)) {
		return Promise.all(dataObjectOrObjects.map(o => toResponseJSON(o, searchParams)));
	}
	
	// Ask the data object for its response JSON representation, updating URLs to point to localhost
	let dataObject = dataObjectOrObjects;
	let responseJSON = dataObject.toResponseJSONAsync
		? await dataObject.toResponseJSONAsync({
			apiURL: `http://localhost:${Zotero.Server.port}/api/`,
			includeGroupDetails: true
		})
		: dataObject;
	
	// Add includes and remove 'data' if not requested
	let include = searchParams.has('include') ? searchParams.get('include') : 'data';
	let dataIncluded = false;
	for (let includeFormat of include.split(',')) {
		switch (includeFormat) {
			case 'bib':
				responseJSON.bib = await citeprocToHTML(dataObject, searchParams, false);
				break;
			case 'citation':
				responseJSON.citation = await citeprocToHTML(dataObject, searchParams, true);
				break;
			case 'data':
				dataIncluded = true;
				break;
			default:
				if (exportFormats.has(includeFormat)) {
					responseJSON[includeFormat] = await exportItems([dataObject], exportFormats.get(includeFormat));
				}
				else {
					// Ignore since we don't have a great way to propagate the error up
				}
		}
	}
	if (!dataIncluded) {
		delete responseJSON.data;
	}
	return responseJSON;
}

/**
 * Use citeproc to output HTML for an item or items.
 *
 * @param {Zotero.Item | Zotero.Item[]} itemOrItems
 * @param {URLSearchParams} searchParams
 * @param {Boolean} asCitationList
 * @returns {Promise<String>}
 */
async function citeprocToHTML(itemOrItems, searchParams, asCitationList) {
	let items = Array.isArray(itemOrItems)
		? itemOrItems
		: [itemOrItems];
	
	// Filter out attachments, annotations, and notes, which we can't generate citations for
	items = items.filter(item => item.isRegularItem());
	let styleIDOrURL = searchParams.get('style') || 'chicago-shortened-notes-bibliography';
	let locale = searchParams.get('locale') || 'en-US';
	let linkWrap = searchParams.get('linkwrap') == '1';
	
	let style = Zotero.Styles.get(styleIDOrURL);
	// If not a URI, try with standard prefix
	if (!style && !styleIDOrURL.includes(':')) {
		style = Zotero.Styles.get('http://www.zotero.org/styles/' + styleIDOrURL);
	}
	if (!style) {
		// The client wants a style we don't have locally, so download it
		// If they didn't pass an absolute URL, resolve relative to the style repo base
		try {
			let styleURL = new URL(styleIDOrURL, 'https://www.zotero.org/styles/');
			if (styleURL.protocol === 'http:' && styleURL.host === 'www.zotero.org') {
				styleURL.protocol = 'https:';
			}
			styleURL = styleURL.toString();
			let { styleID } = await Zotero.Styles.install({ url: styleURL }, styleURL, true);
			style = Zotero.Styles.get(styleID);
		}
		catch (e) {
			throw new BadRequestError(`Invalid style: ${styleIDOrURL} (${e.message})`);
		}
	}
	if (!style) {
		throw new Error(`Unable to install style: ${styleIDOrURL}`);
	}
	
	let cslEngine = style.getCiteProc(locale, 'html');
	cslEngine.opt.development_extensions.wrap_url_and_doi = linkWrap;
	return Zotero.Cite.makeFormattedBibliographyOrCitationList(cslEngine, items, 'html', asCitationList);
}

/**
 * Export items to a string with the given translator.
 *
 * @param {Zotero.Item|Zotero.Item[]} itemOrItems
 * @param {String} translatorID
 * @returns {Promise<String>}
 */
function exportItems(itemOrItems, translatorID) {
	let items = Array.isArray(itemOrItems)
		? itemOrItems
		: [itemOrItems];
	// Filter out annotations, which we can't export
	items = items.filter(item => !item.isAnnotation());
	return new Promise((resolve, reject) => {
		let translation = new Zotero.Translate.Export();
		translation.setItems(items.slice());
		translation.setTranslator(translatorID);
		translation.setHandler('done', () => {
			resolve(translation.string);
		});
		translation.setHandler('error', (_, error) => {
			reject(error);
		});
		translation.translate();
	});
}

/**
 * Evaluate the API's search syntax: https://www.zotero.org/support/dev/web_api/v3/basics#search_syntax
 *
 * @param {Zotero.Search} parentSearch
 * @param {String[]} searchStrings The search strings provided by the client as query parameters
 * @param {String} condition The search condition name
 */
function buildSearchFromSearchSyntax(parentSearch, searchStrings, condition) {
	for (let searchString of searchStrings) {
		let negate = false;
		if (searchString[0] == '-') {
			negate = true;
			searchString = searchString.substring(1);
		}
		if (searchString[0] == '\\' && searchString[1] == '-') {
			searchString = searchString.substring(1);
		}
		
		let childSearch = new Zotero.Search();
		childSearch.libraryID = parentSearch.libraryID;
		childSearch.setScope(parentSearch, true);
		childSearch.addCondition('joinMode', 'any');
		
		let ors = searchString.split('||').map(or => or.trim());
		for (let or of ors) {
			childSearch.addCondition(condition, negate ? 'isNot' : 'is', or);
		}
		
		parentSearch = childSearch;
	}
	return parentSearch;
}

function searchToDebugJSON(search) {
	return {
		conditions: Object.values(search.conditions).map(condition => ({
			condition: condition.condition,
			operator: condition.operator,
			value: condition.value
		})),
		libraryID: search.libraryID,
		scope: search.scope ? searchToDebugJSON(search.scope) : undefined
	};
}

#### Get Item
- **Endpoint:** `GET /items/{itemKey}`
- **Description:** Get a specific item by key
- **Response:** Single item object

#### Create Item
- **Endpoint:** `POST /items`
- **Description:** Create a new item
- **Request Body:** Item JSON object
- **Response:** Created item object

#### Update Item
- **Endpoint:** `PUT /items/{itemKey}`
- **Description:** Update an existing item
- **Request Body:** Updated item JSON object
- **Response:** Updated item object

#### Delete Item
- **Endpoint:** `DELETE /items/{itemKey}`
- **Description:** Delete an item
- **Response:** Success confirmation

#### Get Item File
- **Endpoint:** `GET /items/{itemKey}/file`
- **Description:** Get the file associated with an item
- **Response:** File data

#### Upload Item File
- **Endpoint:** `POST /items/{itemKey}/file`
- **Description:** Upload a file to an item
- **Request Body:** File data
- **Response:** Updated item object

### 2. Collections

#### Get Collections
- **Endpoint:** `GET /collections`
- **Description:** Retrieve collections from a library
- **Query Parameters:**
  - `libraryType` (string): Type of library ('user' or 'group')
  - `libraryID` (number): ID of the library
- **Response:** Array of collection objects

#### Get Collection
- **Endpoint:** `GET /collections/{collectionKey}`
- **Description:** Get a specific collection by key
- **Response:** Single collection object

#### Create Collection
- **Endpoint:** `POST /collections`
- **Description:** Create a new collection
- **Request Body:** Collection JSON object
- **Response:** Created collection object

#### Update Collection
- **Endpoint:** `PUT /collections/{collectionKey}`
- **Description:** Update an existing collection
- **Request Body:** Updated collection JSON object
- **Response:** Updated collection object

#### Delete Collection
- **Endpoint:** `DELETE /collections/{collectionKey}`
- **Description:** Delete a collection
- **Response:** Success confirmation

#### Get Collection Items
- **Endpoint:** `GET /collections/{collectionKey}/items`
- **Description:** Get all items in a collection
- **Response:** Array of item objects

### 3. Libraries

#### Get Libraries
- **Endpoint:** `GET /libraries`
- **Description:** Get all libraries accessible to the user
- **Response:** Array of library objects

#### Get Library
- **Endpoint:** `GET /libraries/{libraryID}`
- **Description:** Get a specific library by ID
- **Response:** Single library object

#### Get Library Items
- **Endpoint:** `GET /libraries/{libraryID}/items`
- **Description:** Get all items in a library
- **Query Parameters:**
  - `itemType` (string, optional): Filter by item type
  - `q` (string, optional): Search query
- **Response:** Array of item objects

### 4. Attachments

#### Upload Attachment
- **Endpoint:** `POST /attachments`
- **Description:** Upload a new attachment
- **Request Body:**
  - `libraryType` (string): Type of library
  - `libraryID` (number): ID of the library
  - `parentItemKey` (string, optional): Parent item key
  - File data
- **Response:** Created attachment item object

#### Get Attachment File
- **Endpoint:** `GET /attachments/{attachmentKey}/file`
- **Description:** Get attachment file data
- **Response:** File data

### 5. Search

#### Search Items
- **Endpoint:** `GET /search`
- **Description:** Search items across libraries
- **Query Parameters:**
  - `libraryType` (string): Type of library
  - `libraryID` (number): ID of the library
  - `q` (string): Search query
  - `itemType` (string, optional): Filter by item type
- **Response:** Array of matching item objects

#### Create Saved Search
- **Endpoint:** `POST /search`
- **Description:** Create a saved search
- **Request Body:** Search object with criteria
- **Response:** Created search object

#### Get Saved Searches
- **Endpoint:** `GET /searches`
- **Description:** Get all saved searches
- **Response:** Array of search objects

### 6. Tags

#### Get Tags
- **Endpoint:** `GET /tags`
- **Description:** Get all tags from a library
- **Query Parameters:**
  - `libraryType` (string): Type of library
  - `libraryID` (number): ID of the library
- **Response:** Array of tag objects

#### Get Tag Items
- **Endpoint:** `GET /tags/{tag}/items`
- **Description:** Get all items with a specific tag
- **Response:** Array of item objects

### 7. Settings

#### Get Settings
- **Endpoint:** `GET /settings`
- **Description:** Get all user settings
- **Response:** Settings object

#### Update Setting
- **Endpoint:** `PUT /settings/{settingName}`
- **Description:** Update a user setting
- **Request Body:** Setting value
- **Response:** Updated setting object

### 8. Trash

#### Get Trash Items
- **Endpoint:** `GET /trash/items`
- **Description:** Get items in the trash
- **Query Parameters:**
  - `libraryType` (string): Type of library
  - `libraryID` (number): ID of the library
- **Response:** Array of item objects

#### Restore from Trash
- **Endpoint:** `POST /trash/items/{itemKey}/restore`
- **Description:** Restore an item from trash
- **Response:** Restored item object

### 9. Groups

#### Get Groups
- **Endpoint:** `GET /groups`
- **Description:** Get all groups the user belongs to
- **Response:** Array of group objects

#### Get Group
- **Endpoint:** `GET /groups/{groupID}`
- **Description:** Get a specific group by ID
- **Response:** Single group object

#### Get Group Collections
- **Endpoint:** `GET /groups/{groupID}/collections`
- **Description:** Get all collections in a group
- **Response:** Array of collection objects

#### Get Group Items
- **Endpoint:** `GET /groups/{groupID}/items`
- **Description:** Get all items in a group
- **Response:** Array of item objects

## Response Formats

### Item Object
```json
{
  "key": "ABC123",
  "version": 1,
  "itemType": "journalArticle",
  "title": "Article Title",
  "creators": [
    {
      "creatorType": "author",
      "firstName": "John",
      "lastName": "Doe"
    }
  ],
  "abstractNote": "",
  "publicationTitle": "Journal Name",
  "volume": "1",
  "issue": "2",
  "pages": "100-200",
  "date": "2024-01-01",
  "DOI": "10.1000/example",
  "url": "https://example.com",
  "tags": [],
  "collections": ["collectionKey"],
  "relations": {},
  "dateAdded": "2024-01-01T00:00:00Z",
  "dateModified": "2024-01-01T00:00:00Z"
}
```

### Collection Object
```json
{
  "key": "COL123",
  "version": 1,
  "name": "Collection Name",
  "parentCollection": "parentKey",
  "relations": {},
  "dateAdded": "2024-01-01T00:00:00Z",
  "dateModified": "2024-01-01T00:00:00Z"
}
```

### Library Object
```json
{
  "id": 123,
  "name": "Library Name",
  "type": "user",
  "relations": {},
  "dateAdded": "2024-01-01T00:00:00Z",
  "dateModified": "2024-01-01T00:00:00Z"
}
```

## Error Responses

All endpoints may return the following error responses:

- **400 Bad Request:** Invalid request parameters or body
- **401 Unauthorized:** Not authenticated (though usually not required for local API)
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Requested resource not found
- **500 Internal Server Error:** Server error

### Error Response Format
```json
{
  "error": "error_type",
  "message": "Human-readable error message",
  "code": 400
}
```

## Rate Limiting

The Zotero local API does not implement rate limiting for local requests.

## CORS

The local API is only accessible from the local machine and does not require CORS configuration for local applications.

## SDKs and Libraries

### Official
- **Python:** `pyzotero` library
- **JavaScript/Node.js:** `zotero-api-client`

### Third-Party
- **PHP:** `zotero-php-client`
- **Ruby:** `zotero-gem`
- **Go:** `go-zotero`

## Examples

### Get All Items from User Library
```bash
curl -X GET "http://localhost:1969/zotero/items?libraryType=user&libraryID=123456"
```

### Create a New Item
```bash
curl -X POST "http://localhost:1969/zotero/items" \
  -H "Content-Type: application/json" \
  -d '{
    "itemType": "journalArticle",
    "title": "Example Article",
    "creators": [{
      "creatorType": "author",
      "firstName": "Jane",
      "lastName": "Smith"
    }],
    "publicationTitle": "Example Journal"
  }'
```

### Upload a File Attachment
```bash
curl -X POST "http://localhost:1969/zotero/attachments" \
  -F "libraryType=user" \
  -F "libraryID=123456" \
  -F "file=@/path/to/document.pdf"
```

### Search Items
```bash
curl -X GET "http://localhost:1969/zotero/search?libraryType=user&libraryID=123456&q=keyword"
```

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Item and collection keys are 8-character alphanumeric strings
- Library IDs are numeric
- The local API runs on port 1969 by default
- File uploads use multipart/form-data encoding
- JSON responses are UTF-8 encoded

## Changelog

### Version 1.0
- Initial release of local API
- Basic CRUD operations for items, collections, and libraries
- File attachment support
- Search functionality

## References

- [Zotero API Documentation](https://www.zotero.org/support/dev/web_api)
- [Zotero Web API v3](https://www.zotero.org/support/dev/web_api/v3/start)
- [Local API Server Source Code](https://github.com/zotero/zotero/blob/main/chrome/content/zotero/xpcom/server/server_localAPI.js)
