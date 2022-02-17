//                            __________________________
//                 .-:=[ XBOX Manager ]=:-.
//
// Install/Uninstall games over FTP to xbox
//
// Read the comments throughout this file for more information
//
// - sairuk

var xboxmanager = "/opt/xboxmanager/xboxmanager.sh";
var xboxconfig = "/opt/xboxmanager/xboxmanager.cfg";
let rn_settings = new Object();

// update log window
function _log(output) {
    document.getElementById("log-area").innerText = output;
}


function loading(id) {
    document.getElementById(id).innerHTML = "";
    document.getElementById(id).innerHTML = '<img src="loading.gif" class="loading"></img>';
}


// installers
function install_options(mode="list-available", xiso=false) {

    var cmd_os = [
        xboxmanager,
        "-u", rn_settings['xbox_username'],
        "-p", rn_settings['xbox_password'],
        "-i", rn_settings['xbox_ipaddress'],
        "-f", rn_settings['xbox_games_drive'],
        "-t", rn_settings['xbox_games_directory'],
        "-l", rn_settings['local_mount_directory'],
        "-a", rn_settings['local_games_directory'],
        "-m", mode
    ];

    //console.log(cmd_os)
    return(cmd_os);

};

// list-available
function list_available() {

    const install_list = document.getElementById('rn-install-list');
    install_list.replaceChildren();

    var cmd_os = install_options();
    //console.log(cmd_os);

    cockpit.spawn(cmd_os, {"err": "out"}).done(function(data) {
        returned = new String(data);
        //console.log(returned);
        _log(returned);

        var items = returned.split('\n');
        items.forEach(item=>{

            if ( item !== "" ) {

                element_name = item.replace(/[_\s]+/g, '-');

                const install_li = document.createElement('li');
                const install_div = document.createElement('div');
                const install_span = document.createElement('span');
                const install_button = document.createElement('button');

                install_list.appendChild(install_li);
                install_li.appendChild(install_div);
                install_span.innerText = item;
                install_div.appendChild(install_span);
                install_div.appendChild(install_button);

                install_button.id = ("install-"+element_name);
                install_button.classList = "rn-installer";
                install_button.innerText = "Install";
                install_button.addEventListener("click", install_xbox);
            }

        })

        //console.log(returned);

    }).fail(function(error){
        returned = new String(error);
        console.log(error);
        _log(returned);
        //alert("Failed, please check log screen");
    });
}

// list-installed
function list_installed() {

    // remove old data
    const install_list = document.getElementById('rn-manage-list');
    //const installers = document.getElementsByClassName('rn-installer');
    install_list.replaceChildren();

    cmd_os = install_options("list-installed");
    //console.log(cmd_os);

    cockpit.spawn(cmd_os, {"err": "out"}).done(function(data) {
        returned = new String(data);
        //console.log(returned);
        _log(returned);

        var items = returned.split('\n');

        items.forEach(item=>{

            if ( item !== "" ) {

                element_name = item.replace(/[_\s]+/g, '-');

                const install_li = document.createElement('li');
                const install_div = document.createElement('div');
                const install_span = document.createElement('span');
                const uninstall_button = document.createElement('button');
                const backup_button = document.createElement('button');

                install_list.appendChild(install_li);
                install_li.appendChild(install_div);
                install_span.innerText = item;
                install_div.appendChild(install_span);
                install_div.appendChild(uninstall_button);

                uninstall_button.id = "uninstall-"+element_name;
                uninstall_button.classList = "rn-manager";
                uninstall_button.innerText = "Uninstall";
                uninstall_button.addEventListener("click", uninstall_xbox);

                install_div.appendChild(backup_button);
                backup_button.id = "backup-"+element_name;
                backup_button.classList = "rn-manager";
                backup_button.innerText = "Backup";
                backup_button.addEventListener("click", backup_xbox);
            }

        })

    }).fail(function(error){
        returned = new String(error);
        console.log(error);
        _log(returned);
        //alert("Failed, please check log screen");
    });
}


// install
function install_xbox() {
    console.log("install_xbox");
    //console.log(rn_settings);

    var target = this.parentNode.firstElementChild.innerText;
    var cmd_os = install_options("install").concat(['-x',target]);

    //console.log(cmd_os);
    target_id = target.replace(/[_\s]+/g, '-');
    //console.log(target_id);

    var target_elem = "install-"+target_id;

    var current = document.getElementById(target_elem).innerHTML;
    loading(target_elem);

    cockpit.spawn(cmd_os, {"err": "out"}).done(function(data) {
        returned = new String(data);
        //console.log(returned);
        _log(returned);
        //console.log(returned);
        list_installed();
        document.getElementById(target_elem).innerHTML = current;

        // refresh lists

    }).fail(function(error){
        returned = new String(error);
        console.log(error);
        _log(returned);
        //alert("Failed, please check log screen");
        document.getElementById(target_elem).innerHTML = current;
    });

}

// uninstall
function uninstall_xbox() {
    console.log("uninstall_xbox");
    //console.log(rn_settings);

    var target = this.parentNode.firstElementChild.innerText;

    var cmd_os = install_options("uninstall").concat(['-x',target]);
    target_id = target.replace(/[_\s]+/g, '-');
    //console.log(cmd_os);

    var target_elem = "uninstall-"+target_id;

    var current = document.getElementById(target_elem).innerHTML;
    loading(target_elem);

    cockpit.spawn(cmd_os, {"err": "out"}).done(function(data) {
        returned = new String(data);
        //console.log(returned);
        _log(returned);
        //console.log(returned);
        document.getElementById(target_elem).innerHTML = current;
        list_installed();

        // refresh lists

    }).fail(function(error){
        returned = new String(error);
        console.log(error);
        _log(returned);
        //alert("Failed, please check log screen");
        document.getElementById(target_elem).innerHTML = current;
    });

}

// backup
function backup_xbox() {
    console.log("backup_xbox");

    var target = this.parentNode.firstElementChild.innerText;
    var cmd_os = install_options("backup").concat(['-x',target]);

    target_id = target.replace(/[_\s]+/g, '-');
    //console.log(cmd_os);
    var target_elem = "backup-"+target_id;

    var current = document.getElementById(target_elem).innerHTML;
    loading(target_elem);

    cockpit.spawn(cmd_os, {"err": "out"}).done(function(data) {
        returned = new String(data);
        //console.log(returned);
        _log(returned);
        //console.log(returned);
        list_installed();
        document.getElementById(target_elem).innerHTML = current;

        // refresh lists

    }).fail(function(error){
        returned = new String(error);
        console.log(error);
        _log(returned);
        //alert("Failed, please check log screen");
        document.getElementById(target_elem).innerHTML = current;
    });
}

// read in the ansible config convert from ansible object to javascript object
// this is used
function read_ansible_cfg() {

    file = cockpit.file(xboxconfig,
    { syntax: JSON,
        binary: false,
        max_read_size: 512,
        superuser: 'false'
    }).read()
   .then((content, tag) => { 
        //rn_settings = yaml_to_js(content);
        rn_settings = content;
        update_input_from_cfg();
        list_available();
        list_installed();
    })
    .catch(error => {
        console.log(error);
        var msg = "Failed to read config file";
        alert(msg);
        _log(msg)
    });    
}

// write a javascript object to ansible format
// this is handled in the called scripts for now
function write_ansible_cfg() {

    // update all settings from inputs

    update_cfg_from_input()

    cockpit.file(xboxconfig,
        { syntax: JSON,
            binary: false,
            max_read_size: 512,
            superuser: false
        }).replace(rn_settings)
       .then((content, tag) => {
            read_ansible_cfg();
        })
        .catch(error => {
            console.log(error);
            var msg = "Failed to read config file";
            alert(msg);
            _log(msg)
        });
}

function update_input_from_cfg() {

    document.getElementById('s-user-name-input').value = rn_settings['xbox_username'];
    document.getElementById('s-update-passwd-input').value = rn_settings['xbox_password'];

    document.getElementById('s-ip-address-input').value = rn_settings['xbox_ipaddress'];
    document.getElementById('s-set-xbox-install-type-input').value = rn_settings['xbox_type'];

    document.getElementById('s-set-xbox-install-drive-input').value = rn_settings['xbox_games_drive'];
    document.getElementById('s-set-xbox-install-dir-input').value = rn_settings['xbox_games_directory'];
    document.getElementById('s-set-local-install-dir-input').value = rn_settings['local_games_directory'];
    document.getElementById('s-set-local-mount-dir-input').value = rn_settings['local_mount_directory'];
}

function update_cfg_from_input() {

    rn_settings['xbox_username'] = document.getElementById('s-user-name-input').value;
    rn_settings['xbox_password'] = document.getElementById('s-update-passwd-input').value;

    rn_settings['xbox_ipaddress'] = document.getElementById('s-ip-address-input').value;
    rn_settings['xbox_type'] = document.getElementById('s-set-xbox-install-type-input').value;

    rn_settings['xbox_games_drive'] = document.getElementById('s-set-xbox-install-drive-input').value;
    rn_settings['xbox_games_directory'] = document.getElementById('s-set-xbox-install-dir-input').value;
    rn_settings['local_games_directory'] = document.getElementById('s-set-local-install-dir-input').value;
    rn_settings['local_mount_directory'] = document.getElementById('s-set-local-mount-dir-input').value;
}

// page switcher, now you see it, now you don't
function show_page() {

    // this is ugly but meh
    const pages = Array.from(document.getElementsByClassName('rn-page-container'));

    pages.forEach(page=>{
        // hide em all first again
        page.classList.replace("rn-show","rn-hidden")
    })

    // show what we clicked on
    document.getElementById(this.id + "-page").classList.replace("rn-hidden","rn-show")

}

// waiting until we're loaded up so the elements we need are available
window.onload = function() {

    // group the elements we require to work with
    // we do this by class because it was easier
    const menuitems = Array.from(document.getElementsByClassName('rn-menu-item'));
    const updaters = Array.from(document.getElementsByClassName('rn-value-updater'));

    // menu items (rn-menu-item)
    menuitems.forEach(menuitem=>{
        menuitem.addEventListener("click", show_page);
    })

    document.getElementById('x-update').addEventListener("click", write_ansible_cfg);
    
    read_ansible_cfg();

}

// nfi what this does, remove it and see what breaks at some point
cockpit.transport.wait(function() { })