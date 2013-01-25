dojo
		.ready(function() {
			// Constructing the Tree in the left pane.
			require(
					[ "dojo/_base/lang", "dojo/on", "dijit/registry",
							"dojo/request/xhr", "dojo/_base/window",
							"dojox/widget/Standby", "dijit/Dialog",
							"dojox/widget/Toaster", "dijit/registry",
							"dojo/data/ItemFileReadStore",
							"dojo/data/ItemFileWriteStore",
							"dijit/tree/ForestStoreModel", "dijit/Tree",
							"dijit/Menu", "dijit/MenuItem",
							"dojox/grid/DataGrid", "dijit/form/Button",
							"dijit/layout/ContentPane", "dijit/form/Form",
							"dijit/_WidgetsInTemplateMixin",
							"dojox/validate/regexp", "dojox/grid/EnhancedGrid",
							"dojox/grid/enhanced/plugins/DnD",
							"dojox/grid/enhanced/plugins/Pagination",
							"dojox/grid/enhanced/plugins/Menu" ],

					function(lang, on, registry, xhr, window, Standby, Dialog,
							Toaster, Registry, ItemFileReadStore,
							ItemFileWriteStore, ForestStoreModel, Tree, Menu,
							MenuItem, DataGrid, Button, ContentPane, Form,
							_WidgetsInTemplateMixin, regexp, EnhancedGrid, DnD,
							Pagination, GridMenu) {

						var storeCourse = new ItemFileReadStore({
							url : "GetCourses"
						});

						modelCourse = new ForestStoreModel(
								{
									store : storeCourse,
									query : {
										"id" : "*"
									},
									labelAttr : "name",
									rootId : "course",
									rootLabel : "Courses",
									mayHaveChildren : function(item) {
										return item.root;
									},
									getChildren : function(parentItem,
											callback, onError) {
										if (parentItem.root == true) {
											if (this.root.children) {
												callback(this.root.children);
											} else {
												this.store
														.fetch({
															query : this.query, // Call
															// all
															// parents
															queryOptions : {
																cache : false
															},
															onComplete : dojo
																	.hitch(
																			this,
																			function(
																					items) {
																				this.root.children = items;
																				callback(items);
																			}),
															onError : onError
														});
											}
										} else {
											callback(parentItem.students);
										} // if( parentItem.root == true )
									} // getChildren
								});

						treeCourses = new Tree({
							model : modelCourse,
							openOnClick : true,
							showRoot : true,
							onClick : handleCourseSelection
						});
						setCourseContextMenu(treeCourses);
						treeCourses.placeAt(dojo.byId('divCourse'));
						treeCourses.startup();

						var isStudentGridRendered = false;

						function handleCourseSelection(item, node, evt) {
							// Switching to the correct tab.
							dijit.byId("tabContainer").selectChild("tabGrid");

							gridStoreStudent._jsonFileUrl = "GetCourses?courseId="
									+ item.id;
							if (!isStudentGridRendered) {
								dojo.byId("titleInitial").innerHTML = "";
								dojo.byId("titleSimpleGrid").style.display = "block";
								gridStudent.placeAt("divStudentsGrid");
								gridStudent.startup();

								dojo.byId("titleEnhancedGrid").style.display = "block";
								gridEnhanced.placeAt("divStudentsEnhancedGrid");
								gridEnhanced.startup();
								dojo.connect(gridEnhanced.pluginMgr
										.getPlugin('dnd'), 'onDropInternal',
										function(sourcePlugin, isCopy) {
											alert("connected to drop event!");
										});
								isStudentGridRendered = true;
							}
							refreshStudentGrids();
						}

						function refreshStudentGrids() {
							gridStoreStudent.close();
							gridStudent._refresh();
							gridEnhanced._refresh();
						}

						function setCourseContextMenu(tree) {
							var pMenu = new Menu();
							pMenu.addChild(new MenuItem({
								label : "Students",
								onClick : function(event) {
									new Dialog({
										title : "Selected!",
										content : "You've selected me...",
										style : "width: 300px"
									}).show();
								}
							}));
							pMenu.addChild(new MenuItem({
								label : "Exit",
							}));
							pMenu.bindDomNode(tree.domNode);
							//
							// dojo.connect(pMenu, "_openMyself", this,
							// function(e) {
							// var tn = dijit.getEnclosingWidget(e.target);
							// // contrived condition: if this tree node doesn't
							// have
							// any
							// // children, disable all of the menu items
							// pMenu.getChildren().forEach(function(node) {
							// node.set('disabled', tn.getChildren().length >
							// 0);
							// });
							// });
						}

						// Creating the data grid.
						gridStoreStudent = new ItemFileWriteStore({
							url : "",
							clearOnClose : true,
							urlPreventCache : true,
							onSet : function(item, attribute, oldValue,
									newValue) {
								alert("chaned");
							}
						});

						var gridLayout = [ [
								{
									'name' : 'ID',
									'field' : 'id'
								},
								{
									'name' : 'Name',
									'field' : 'name'
								},
								{
									'name' : 'Age',
									'field' : 'age'
								},
								{
									'name' : 'EMail',
									'field' : 'email',
									'width' : '150px'
								},
								{
									'name' : '#',
									'field' : 'id',
									formatter : function(studId) {
										var btnEdit;
										btnEdit = new Button(
												{
													label : "Edit",
													studentId : studId,
													onClick : function(event) {
														var studRec = {
															id : studId,
															name : ""
														};
														dojo
																.every(
																		gridStoreStudent._arrayOfAllItems,
																		function(
																				item) {
																			if (item.id == studId) {
																				studRec = item;
																				return false;
																			}
																			return true;
																		});
														handleEditStudent(
																event, studRec);
													}
												});
										btnEdit._destroyOnRemove = true;
										return btnEdit;
									}
								} ] ];

						gridStudent = new DataGrid({
							id : 'simpleGrid',
							autoWidth : true,
							store : gridStoreStudent,
							structure : gridLayout,
							rowSelector : '20px',
							onFetchError : function(err, req) {
								alert(err);
							}
						});

						tabContainer = dijit.byId("tabContainer");

						function getTab(tabId) {
							var tab = null;
							dojo.every(tabContainer.getChildren(), function(
									child) {
								if (child.id == tabId) {
									tab = child;
									return false;
								}
								return true;
							});
							return tab;
						}

						function handleEditStudent(event, studRec) {
							// If tab is already open, then show that tab and
							// reload values.
							var tabId = "editStud_" + studRec.id;

							var tab = getTab(tabId);
							if (tab) {
								tabContainer.selectChild(tab);
								return;
							}

							var i18n = {
								id : "ID",
								name : "Name",
								nameRules : "Name should contain only alphabets, spaces &<br> dots and minimum 4 letters.",
								age : "Age",
								ageRules : "Age should be only numbers and 0 to 99.",
								email : "EMail",
								emailRules : "Enter a valid email.",
								save : "Save",
								pleaseWait : "Please wait…",
								success : "It worked! Yay!",
								ok : "OK!"
							};

							var template = "EditStudFormTemplate";
							dojo
									.declare(
											"form.StudForm",
											[ Form, _WidgetsInTemplateMixin ],
											{
												templateString : dojo
														.byId(template).innerHTML,

												i18n : i18n,

												postCreate : function() {
													// Setting the values.
													this.domNode.id.value = studRec.id;
													this.domNode.name.value = studRec.name;
													this.domNode.age.value = studRec.age;
													this.domNode.email.value = studRec.email;
													this.watch("state",
															this.checkValid);
													this.inherited(arguments);
												},
												checkValid : function() {
													this.enable({
														submitForm : this
																.isValid()
													});
												},

												_onSubmit : function() {
													if (!this.validate()) {
														alert("Please correct the errors before proceeding...");
														return;
													}
													var params = dojo
															.formToQuery(this.domNode);
													// Add saving overlay.
													var standby = new Standby(
															{
																target : this.domNode.children[0],
																duration : 0
															});
													dojo.body().appendChild(
															standby.domNode);
													standby.show();
													xhr
															.post(
																	"GetCourses",
																	{
																		handleAs : "text",
																		preventCache : true,
																		data : params
																	})
															.then(
																	function(
																			data) {
																		standby
																				.hide();
																		alert(data);
																		tabContainer
																				.removeChild(getTab(tabId));
																		registry
																				.remove(tabId);
																		tabContainer
																				.selectChild("tabGrid");
																		refreshStudentGrids();
																	},
																	function(
																			err) {
																		standby
																				.hide();
																		alert("Error saving the data...");
																	});
												}
											});

							// Adding a tab for student form.
							var editTab = new ContentPane({
								id : tabId,
								title : "Edit - " + studRec.name,
								content : new form.StudForm({
									dialog : this.dialog
								}),
								selected : true,
								closable : true
							});
							tabContainer.addChild(editTab);
							tabContainer.selectChild(editTab);
						}

						// Enhanced Grid
						gridEnhanced = new dojox.grid.EnhancedGrid({
							id : 'enhancedGrid',
							store : gridStoreStudent,
							autoWidth : true,
							structure : gridLayout,
							rowSelector : '20px',
							plugins : {
								pagination : {
									gotoButton : true,
									/* page step to be displayed */
									maxPageStep : 3,
									/* position of the pagination bar */
									position : "bottom",
									pageSizes : [ "25", "50", "75", "All" ]
								},
								menus : {
									cellMenu : "gridMenuForCell"
								},
								dnd : {
									dndConfig : {
										"row" : {
											"within" : true,
											"in" : false,
											"out" : false
										},
										"col" : {
											"within" : true,
											"in" : false,
											"out" : false
										},
										"cell" : {
											"within" : false,
											"in" : false,
											"out" : false
										}
									}
								}
							}
						}, document.createElement('div'));
						/* Updating existing paging toolbar texts */
						var pagination = gridEnhanced.pluginMgr
								.getPlugin("pagination");
						pagination._nls[1] = "All students";
						pagination._nls[2] = "${0} students per page";
						pagination._nls[4] = "students";
						pagination._nls[5] = "student";

						// Adding events to grid context menus.
						var rowIndex = -1, colIndex = -1;
						dojo.connect(gridEnhanced, 'onCellContextMenu',
								function(e) {
									rowIndex = e.rowIndex;
									colIndex = e.cellIndex;
								});

						on(dijit.byId("gridMenuSelectMe"), "click", function() {
							var toaster = dijit.byId("toasterSelectedCell");
							toaster.positionDirection = "tr-down";
							toaster.setContent("Selected row: " + rowIndex
									+ "/col: " + colIndex);
							toaster.show();
						});
					});
		});