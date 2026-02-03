export const MenuItems = [
      {
        path: `${import.meta.env.BASE_URL}dashboard`,
        icon: <i className="fe fe-airplay"></i>,
        type: "link",
        selected: false,
        active: false,
        title: "Dashboard",
      },
      {
        icon:<i className="fe fe-grid"></i>,
        type: 'sub', active: false, selected: false, title: 'Master', children: [
          { path: `${import.meta.env.BASE_URL}master/membermaster`, type: 'link', active: false, selected: false, title: 'Member Master' },
          {
        path: `${import.meta.env.BASE_URL}master/rolemaster`,
        type: "link",
        selected: false,
        active: false,
        title: "Role Master",
      },
          { path: `${import.meta.env.BASE_URL}master/teammaster`, type: 'link', active: false, selected: false, title: 'Team Master' },
          // { path: `${import.meta.env.BASE_URL}master/miqaatmaster`, type: 'link', active: false, selected: false, title: 'Miqaat Master' },
          { path: `${import.meta.env.BASE_URL}master/venuemaster`, type: 'link', active: false, selected: false, title: 'Venue Master' }
          // {
          //   title: "Back Office", type: "sub", dirchange: false, selected: false, active: false, children: [
          //     { path: "", type: 'empty', active: false, dirchange: false, selected: false, title: 'Duties' },
          //     {
          //       title: "Sub Menu-2-2", type: "sub", dirchange: false, selected: false, active: false, children: [
          //         { path: "", type: 'empty', active: false, dirchange: false, selected: false, title: 'Sub Menu-2-2-1' },
          //         { path: "", type: 'empty', active: false, dirchange: false, selected: false, title: 'Sub Menu-2-2-2' }
          //       ]
          //     },
          //   ]
          // },
        ]
      },
      {
        path: `${import.meta.env.BASE_URL}master/miqaatmaster`,
        icon: <i className="fe fe-airplay"></i>,
        type: "link",
        selected: false,
        active: false,
        title: "Miqaat Master",
      },
            
      {
        icon:<i className="fe fe-grid"></i>,
        type: 'sub', active: false, selected: false, title: 'Back Office', children: [
         
          { path: `${import.meta.env.BASE_URL}backoffice/duties`, type: 'link', active: false, selected: false, title: 'Duties' },
          { path: `${import.meta.env.BASE_URL}backoffice/locationincharge`, type: 'link', active: false, selected: false, title: 'Location Incharge' }

          
        ]
      },
            {
        icon:<i className="fe fe-grid"></i>,
        type: 'sub', active: false, selected: false, title: 'Reports', children: [
         
          { path: `${import.meta.env.BASE_URL}reports/attendancereport`, type: 'link', active: false, selected: false, title: 'Attendance Report' },
          
          
        ]
      },

      // Customs Pages
      // {
      //   icon: <i className="fe fe-aperture"></i>,
      //   type: "sub",
      //   Name: "",
      //   active: false,
      //   selected: false,
      //   badge: "",
      //   badgetxt: "",
      //   class: "",
      //   title: "Customs Pages ",
      //   children: [
     
      //     {
      //       path: `${import.meta.env.BASE_URL}custompages/error-404`,
      //       title: "404 Error",
      //       type: "link",
      //       active: false,
      //       selected: false,
      //     },
        
      //   ],
      // },


    // ],
  // },
];
