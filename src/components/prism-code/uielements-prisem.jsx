export const reactalert1 = `<Alert variant='warning' className="alert alert-warning alert-dismissible fade show" role="alert" show={show} onClick={toggleShow}>
    <strong>Holy guacamole!</strong> You should check in on some of those fields
    below.
    <Button variant='' type="button" className="btn-close" data-bs-dismiss="alert"
        aria-label="Close"><i className="bi bi-x"></i>
    </Button>
</Alert>`

export const reactalert2 = `
const Alerts=()=> {
    const [alerts,setAlerts]=useState([]);
    const handleShowAlert=()=> {
        const newAlert= {
            id: new Date().getTime(), // Unique ID for each alert
        };
        setAlerts((prevAlerts)=> [...prevAlerts, newAlert]);
        // Automatically remove the alert after 5 seconds
        setTimeout(()=> {
                setAlerts((prevAlerts)=> prevAlerts.filter((alert)=> alert.id !==newAlert.id));
            }, 5000);
    };
    return (
        <Fragment> {
               alerts.map((alert)=> (
                   <Alert key= {alert.id} variant="success" className="alert alert-warning 
                     alert-dismissible fade show" role="alert" >
                       <strong>Holy guacamole !</strong> 
                         You should check in on some of those fields below. 
                         <Button variant="" type="button" className="btn-close" 
                           data-bs-dismiss="alert" aria-label="Close" 
                           onClick= {()=> setAlerts((prevAlerts)=> prevAlerts.filter(
                            (a)=> a.id !==alert.id))}> 
                         <i className="bi bi-x" ></i> 
                        </Button> 
                    </Alert>)) }
                  <Button type="button" className='mt-2' onClick= {handleShowAlert}> 
                    Show live alert 
                  </Button> 
        </Fragment>
   );
};
export default Alerts;
`

export const reactalert3 = `{Defaultalerts.map((idx, alt1)=>(                                                                       
<Alert variant={idx.class} className="alert" role="alert" key={alt1}>
   {idx.text}
</Alert>
))}`

export const dataalert3 = `
interface alert3 {
	id: number
	text: string
	class: string
}

export const Defaultalerts = [
  { id: 1, text: " A simple primary alert—check it out!", class: "primary" },
  { id: 2, text: " A simple secondary alert—check it out!", class: "secondary" },
  { id: 3, text: " A simple success alert—check it out!", class: "success" },
  { id: 4, text: " A simple danger alert—check it out!", class: "danger" },
  { id: 5, text: " A simple warning alert—check it out!", class: "warning" },
  { id: 6, text: " A simple info alert—check it out!", class: "info" },
  { id: 7, text: " A simple light alert—check it out!", class: "light" },
  { id: 8, text: " A simple dark alert—check it out!", class: "dark" },

];`

export const reactalert4 = `{Linkalerts.map((idx, alt2)=>(                                   
<Alert variant={idx.class} className="alert" role="alert" key={alt2}>
{idx.text1} <Link to="#" className="alert-link">{idx.text2}</Link>.{idx.text3} </Alert>
))}`
export const dataalert4 = `
interface alert4 {
	text1: string
	text2: string
	text3: string
	class: string
}
export const Linkalerts = [
  { id: 1, text1: "A simple primary alert with ", text2: "an example link", text3: "Give it a click if you like", class: "primary" },
  { id: 2, text1: "A simple secondary alert with", text2: "an example link", text3: "Give it a click if you like", class: "secondary" },
  { id: 3, text1: "A simple success alert with", text2: "an example link", text3: "Give it a click if you like", class: "success" },
  { id: 4, text1: "A simple danger alert with ", text2: "an example link", text3: "Give it a click if you like", class: "danger" },
  { id: 5, text1: "A simple warning alert with ", text2: "an example link", text3: "Give it a click if you like", class: "warning" },
  { id: 6, text1: "A simple info alert with", text2: "an example link", text3: "Give it a click if you like", class: "info" },
  { id: 7, text1: "A simple light alert with ", text2: "an example link", text3: "Give it a click if you like", class: "light" },
  { id: 8, text1: "A simple dark alert with", text2: "an example link", text3: "Give it a click if you like", class: "dark" },

];
`

export const reactalert5 = `
const Alerts = () => {
    const [solidalert, setSolidalert] = useState(Solidalerts);
    const handleRemove = (id) => {
        const newList = solidalert.filter((list) => list.id !== id);
        setSolidalert(newList);
    };

    return (
        <Fragment>
            {solidalert.map((idx, alt3) => (
                 <Alert variant={idx.class} className="alert alert-dismissible fade show" 
                    key={alt3}>
                     {idx.text}
                     <Button variant='' type="button" className="btn-close" data-bs-dismiss="alert" 
                         aria-label="Close"
                         onClick={() => handleRemove(idx.id)}><i className="bi bi-x"></i></Button>
                  </Alert>
               ))}
        </Fragment>
    );
};
export default Alerts;`
export const dataalert5 = `
interface alert5 {
	id: number
	text: string
	class: string
}
export const Solidalerts = [
  { id: 1, text: "A simple solid primary alert-check it out! ", class: "solid-primary" },
  { id: 2, text: "A simple solid secondary alert-check it out!", class: "solid-secondary" },
  { id: 3, text: "A simple solid info alert-check it out!", class: "solid-info" },
  { id: 4, text: "A simple solid warning alert-check it out! ", class: "solid-warning" },
  { id: 5, text: "A simple solid success alert-check it out!", class: "solid-success" },
  { id: 6, text: "A simple solid danger alert-check it out! ", class: "solid-danger" },
  { id: 7, text: "A simple solid light alert-check it out! ", class: "solid-light" },
  { id: 8, text: "A simple solid dark alert-check it out!", class: "solid-dark" },

];
`
export const reactalert6 = `
const Alerts = () => {
    const [outlinealert, setOutlinealert] = useState(Outlinealerts);
    const handleRemove1 = (id) => {
        const newList = outlinealert.filter((list) => list.id !== id);
        setOutlinealert(newList);
    };
    return (
        <Fragment>
            {outlinealert.map((idx, alt4) => (
                <Alert variant={idx.class} className="alert alert- alert-dismissible fade show" 
                   key={alt4}>
                    {idx.text}
                        <Button variant='' type="button" className="btn-close"
                                onClick={() => handleRemove1(idx.id)} data-bs-dismiss="alert"
                                 aria-label="Close">
                            <i className="bi bi-x"></i>
                        </Button>
                </Alert>
            ))}
        </Fragment>
    );
};
export default Alerts;`

export const dataalert6 = `
interface alert6 {
	id: number
	text: string
	class: string
}
export const Outlinealerts = [
  { id: 1, text: "A simple outline primary alert-check it out! ", class: "outline-primary" },
  { id: 2, text: "A simple outline secondary alert-check it out!", class: "outline-secondary" },
  { id: 3, text: "A simple outline info alert-check it out!", class: "outline-info" },
  { id: 4, text: "A simple outline warning alert-check it out! ", class: "outline-warning" },
  { id: 5, text: "A simple outline success alert-check it out!", class: "outline-success" },
  { id: 6, text: "A simple outline danger alert-check it out! ", class: "outline-danger" },
  { id: 7, text: "A simple outline light alert-check it out! ", class: "outline-light" },
  { id: 8, text: "A simple outline dark alert-check it out!", class: "outline-dark" },
];
`
export const reactalert7 = `
const Alerts = () => {
    const [shadowsolidalert, setShadowsolidalert] = useState(Shadowsolidalerts);
    const handleRemove2 = (id) => {
        const newList = shadowsolidalert.filter((list) => list.id !== id);
        setShadowsolidalert(newList);
    };
    return (
        <Fragment>
            {shadowsolidalert.map((idx, alt5) => (
                <Alert variant={idx.class} className={'alert shadow-#$36{idx.size} 
                alert-dismissible fade show'}  key={alt5}>
                   {idx.text}
                    <Button variant='' type="button" className="btn-close" 
                        data-bs-dismiss="alert"
                      onClick={() => handleRemove2(idx.id)}
                                    aria-label="Close">
                    <i className="bi bi-x"></i></Button>
                </Alert>
            ))}
        </Fragment>
    );
};
export default Alerts;`
export const dataalert7 = `
interface alert7 {
	id: number
	text: string
	class: string
    size:string
}
export const Shadowsolidalerts = [
  { id: 1, text: "A simple solid primary alert with small shadow—check it out! ", class: "solid-primary", size: "sm" },
  { id: 2, text: "A simple solid primary alert with normal shadow—check it out! ", class: "solid-primary", size: "" },
  { id: 3, text: "A simple solid primary alert with large shadow—check it out! ", class: "solid-primary", size: "lg" },
  { id: 4, text: "A simple solid secondary alert with small shadow—check it out!", class: "solid-secondary", size: "sm" },
  { id: 5, text: "A simple solid secondary alert with normal shadow—check it out!", class: "solid-secondary", size: "" },
  { id: 6, text: "A simple solid secondary alert with large shadow—check it out!", class: "solid-secondary", size: "lg" },

];`

export const reactalert8 = `
 {Defaultsolidalerts.map((idx, alt6) => (
     <Alert variant={idx.class} className={'alert shadow-&#38{idx.size}'} key={alt6}>A simple primary alert with small shadow—check it out!</Alert>
  ))}
`
export const dataalert8 = `
interface alert8 {
	id: number
	text: string
	class: string
    size:string
}
export const Defaultsolidalerts = [
  { id: 1, text: "A simple solid primary alert with small shadow—check it out! ", class: "primary", size: "sm" },
  { id: 2, text: "A simple solid primary alert with normal shadow—check it out! ", class: "primary", size: "" },
  { id: 3, text: "A simple solid primary alert with large shadow—check it out! ", class: "primary", size: "lg" },
  { id: 4, text: "A simple solid secondary alert with small shadow—check it out!", class: "secondary", size: "sm" },
  { id: 5, text: "A simple solid secondary alert with normal shadow—check it out!", class: "secondary", size: "" },
  { id: 6, text: "A simple solid secondary alert with large shadow—check it out!", class: "secondary", size: "lg" },
];
`


export const reactalert9 = `
const Alerts = () => {
      const [roundedsolidalert, setRoundedsolidalert] = useState(Roundedsolidalerts);
    const handleRemove3 = (id) => {
        const newList = roundedsolidalert.filter((list) => list.id !== id);
        setRoundedsolidalert(newList);
    };
    return (
        <Fragment>
             {roundedsolidalert.map((idx, alt7) => (
                <Alert variant={idx.class} className="alert  rounded-pill alert-dismissible 
                    fade show" key={alt7}>
                    {idx.text}
                    <Button variant='' type="button" className="btn-close" 
                      data-bs-dismiss="alert" aria-label="Close"
                        onClick={() => handleRemove3(idx.id)}>
                      <i className="bi bi-x"></i></Button>
                </Alert>
             ))}
        </Fragment>
    );
};
export default Alerts;`
export const dataalert9 = `
interface alert9 {
	id: number
	text: string
	class: string
}
export const Roundedsolidalerts = [
  { id: 1, text: "A simple solid rounded primary alert—check it out! ", class: "solid-primary" },
  { id: 2, text: "A simple solid rounded secondary alert—check it out! ", class: "solid-info" },
  { id: 3, text: "A simple solid rounded warning alert—check it out! ", class: "solid-warning" },
  { id: 4, text: "A simple solid rounded danger alert—check it out!", class: "solid-danger" }
];
`

export const reactalert10 = `
const Alerts = () => {
    const [roundedoutlinealert, setRoundedOutlinealert] = useState(Roundedoutlinealerts);
    const handleRemove4 = (id) => {
        const newList = roundedoutlinealert.filter((list) => list.id !== id);
        setRoundedOutlinealert(newList);
    };
    return (
        <Fragment>
             {roundedoutlinealert.map((idx) => (
                <Alert variant={idx.class} className="alert rounded-pill 
                   alert-dismissible fade show" 
                  key={Math.random()}>
                    {idx.text}
                    <Button variant='' type="button" className="btn-close" d
                      ata-bs-dismiss="alert" aria-label="Close"
                         onClick={() => handleRemove4(idx.id)}>
                        <i className="bi bi-x"></i>
                    </Button>
                </Alert>
             ))}
        </Fragment>
    );
};
export default Alerts;`
export const dataalert10 = `
interface alert10 {
	id: number
	text: string
	class: string
}
export const Roundedoutlinealerts = [
  { id: 1, text: "A simple outline rounded primary alert—check it out! ", class: "outline-primary" },
  { id: 2, text: "A simple outline rounded secondary alert—check it out! ", class: "outline-info" },
  { id: 3, text: "A simple outline rounded warning alert—check it out! ", class: "outline-warning" },
  { id: 4, text: "A simple outline rounded danger alert—check it out!", class: "outline-danger" }
];
`

export const reactalert11 = `
const Alerts = () => {
    const [roundeddefaultalert, setRoundedDefaultalert] = useState(Roundedefaultalerts);
    const handleRemove5 = (id) => {
        const newList = roundeddefaultalert.filter((list) => list.id !== id);
        setRoundedDefaultalert(newList);
    };
    return (
        <Fragment>
             {roundeddefaultalert.map((idx) => (
                <Alert variant={idx.class} className="alert rounded-pill alert-dismissible 
                  fade show" key={Math.random()}>
                    {idx.text}
                    <Button variant='' type="button" className="btn-close" 
                         data-bs-dismiss="alert" aria-label="Close"
                            onClick={() => handleRemove5(idx.id)}>
                        <i className="bi bi-x"></i></Button>
                </Alert>
            ))}
        </Fragment>
    );
};
export default Alerts;`
export const dataalert11 = `
interface alert11 {
	id: number
	text: string
	class: string
}
export const Roundedefaultalerts = [
  { id: 1, text: "A simple rounded primary alert—check it out! ", class: "primary" },
  { id: 2, text: "A simple rounded secondary alert—check it out! ", class: "info" },
  { id: 3, text: "A simple rounded warning alert—check it out! ", class: "warning" },
  { id: 4, text: "A simple rounded danger alert—check it out!", class: "danger" }
];
`

export const reactalert12 = `
const Alerts = () => {
    const [roundedwithbtnalert, setRoundedwithbtnalert] = useState(Roundewithbtnalerts);
    const handleRemove6 = (id) => {
        const newList = roundedwithbtnalert.filter((list) => list.id !== id);
        setRoundedwithbtnalert(newList);
    };
    return (
        <Fragment>
              {roundedwithbtnalert.map((idx) => (
                <Alert variant={idx.class} className="alert rounded-pill 
                   alert-dismissible custom-rounded-alerts 
                  fade show" key={Math.random()}>
                    {idx.text}
                    <Button variant='' type="button" className="btn-close custom-close" 
                        data-bs-dismiss="alert" aria-label="Close"
                         onClick={() => handleRemove6(idx.id)}>
                            <i className="bi bi-x"></i>
                    </Button>
                </Alert>
              ))}
        </Fragment>
    );
};
export default Alerts;`
export const dataalert12 = `
interface alert12 {
	id: number
	text: string
	class: string
}
export const Roundewithbtnalerts = [
  { id: 1, text: "A simple rounded primary alert—check it out! ", class: "primary" },
  { id: 2, text: "A simple rounded secondary alert—check it out! ", class: "info" },
  { id: 3, text: "A simple rounded warning alert—check it out! ", class: "warning" },
  { id: 4, text: "A simple rounded danger alert—check it out!", class: "danger" }
];
`


export const reactalert13 = ` <Alert variant='primary' className="alert d-flex align-items-center" role="alert">
    <svg className="flex-shrink-0 me-2 svg-primary" xmlns="http://www.w3.org/2000/svg" height="1.5rem" viewBox="0 0 24 24" width="1.5rem" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
    <div>
        An example alert with an icon
    </div>
</Alert>
<Alert variant='success' className="alert  d-flex align-items-center" role="alert">
    <svg className="flex-shrink-0 me-2 svg-success" xmlns="http://www.w3.org/2000/svg" height="1.5rem" viewBox="0 0 24 24" width="1.5rem" fill="#000000"><path d="M0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none" /><path d="M16.59 7.58L10 14.17l-3.59-3.58L5 12l5 5 8-8zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" /></svg>
    <div>
        An example success alert with an icon
    </div>
</Alert>
<Alert variant='warning' className="alert  d-flex align-items-center" role="alert">
    <svg className="flex-shrink-0 me-2 svg-warning" xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="1.5rem" viewBox="0 0 24 24" width="1.5rem" fill="#000000"><g><rect fill="none" height="24" width="24" /></g><g><g><g><path d="M12,5.99L19.53,19H4.47L12,5.99 M12,2L1,21h22L12,2L12,2z" /><polygon points="13,16 11,16 11,18 13,18" /><polygon points="13,10 11,10 11,15 13,15" /></g></g></g></svg>
    <div>
        An example warning alert with an icon
    </div>
</Alert>
<Alert variant='danger' className="alert  d-flex align-items-center" role="alert">
    <svg className="flex-shrink-0 me-2 svg-danger" xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="1.5rem" viewBox="0 0 24 24" width="1.5rem" fill="#000000"><g><rect fill="none" height="24" width="24" /></g><g><g><g><path d="M15.73,3H8.27L3,8.27v7.46L8.27,21h7.46L21,15.73V8.27L15.73,3z M19,14.9L14.9,19H9.1L5,14.9V9.1L9.1,5h5.8L19,9.1V14.9z" /><rect height="6" width="2" x="11" y="7" /><rect height="2" width="2" x="11" y="15" /></g></g></g></svg>
    <div>
        An example danger alert with an icon
    </div>
</Alert>`


export const reactalert14 = ` 
const Alerts = () => {
    const [customized1alert, setcustomized1alert] = useState(Customizedalert1);
    const handleRemove12 = (id) => {
        const newList = customized1alert.filter((list) => list.id !== id);
        setcustomized1alert(newList);
    };
    return (
        <Fragment>
              {customized1alert.map((idx) => (
                <Alert variant={idx.color} className="alert alert-dismissible fade show 
                   custom-alert-icon shadow-sm" role="alert" key={Math.random()}>
                    <svg className={'me-2 svg-$#38{idx.color}'} xmlns="http://www.w3.org/2000/svg" 
                      height="1.5rem" viewBox="0 0 24 24" width="1.5rem" fill="#000000">
                            <path d="M0 0h24v24H0z" fill="none" /><path d={idx.class1} />
                    </svg>
                        A customized {idx.color} alert with an icon
                        <Button variant='' type="button" className="btn-close" 
                         data-bs-dismiss="alert" aria-label="Close" 
                          onClick={() => handleRemove12(idx.id)}>
                          <i className="bi bi-x"></i>
                        </Button>
                </Alert>
               ))}
        </Fragment>
    );
};
export default Alerts;`
export const dataalert14 = `
interface alert14 {
	id: number
	class1: string
}
export const Customizedalert1 = [
  { id: 1, class1: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z", color: 'primary' },
  { id: 2, class1: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z", color: 'secondary', },
  { id: 3, class1: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z", color: 'warning', },
  { id: 4, class1: "M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z", color: 'danger', },
];
 `

export const reactalert15 = ` 
const Alerts = () => {
    const [imagesalert, setimagesalert] = useState(Imagealerts);
    const handleRemove8 = (id) => {
        const newList = imagesalert.filter((list) => list.id !== id);
        setimagesalert(newList);
    };
    return (
        <Fragment>
              {imagesalert.map((idx) => (
                <Alert variant={idx.color} className="alert alert-img alert-dismissible 
                  fase show rounded-pill flex-wrap" role="alert" key={Math.random()}>
                    <div className="avatar avatar-sm me-3 avatar-rounded">
                        <img src={idx.src1} alt="img" />
                    </div>
                    <div>
                       A simple {idx.color} alert with image—check it out!
                    </div>
                    <Button variant='' type="button" className="btn-close" data-bs-dismiss="alert" 
                      aria-label="Close" onClick={() => handleRemove8(idx.id)}>
                        <i className={'bi bi-x  $#38{idx.class}'}></i></Button>
                </Alert>
               ))}
        </Fragment>
    );
};
export default Alerts;`
export const dataalert15 = `
interface alert15 {
	id: number
	src1: string
    color: string
    class: string
}
export const Imagealerts = [
  { id: 1, src1:"../../../assets/images/faces/3.jpg", color: 'primary', class: '' },
  { id: 2, src1:"../../../assets/images/faces/5.jpg", color: 'secondary', class: '' },
  { id: 3, src1:"../../../assets/images/faces/8.jpg", color: 'warning', class: '' },
  { id: 4, src1:"../../../assets/images/faces/11.jpg", color: 'danger', class: '' },
  { id: 5, src1:"../../../assets/images/faces/13.jpg", color: 'info', class: '' },
  { id: 6, src1:"../../../assets/images/faces/10.jpg", color: 'light', class: '' },
  { id: 7, src1:"../../../assets/images/faces/15.jpg", color: 'dark', class: 'text-muted' },
];
`

export const reactalert16 = `
const Alerts = () => {
     const [avataralert, setavataralert] = useState(avatarsizealert);
    const handleRemove9 = (id) => {
        const newList = avataralert.filter((list) => list.id !== id);
        setavataralert(newList);
    };
    return (
        <Fragment>
              {avataralert.map((idx) => (
                <Alert variant={idx.color} className="alert alert-img alert-dismissible fase 
                  show flex-wrap" role="alert" key={Math.random()}>
                    <div className={'avatar avatar-$#38{idx.class} me-3'}>
                        <img src={idx.src1} alt="img" />
                    </div>
                    <div>
                      A simple {idx.color} alert with image—check it out!
                    </div>
                    <Button variant='' type="button" className="btn-close" 
                     data-bs-dismiss="alert"
                        aria-label="Close" onClick={() => handleRemove9(idx.id)}>
                        <i className={'bi bi-x $#38{idx.class1}'}></i>
                    </Button>
                </Alert>
               ))}
        </Fragment>
    );
};
export default Alerts;`
export const dataalert16 = `
interface alert16 {
	id: number
	src1: string
    color: string
    class: string
    class1: string
}
export const avatarsizealert = [
  { id: 1, src1: "../../../assets/images/faces/3.jpg", color: 'primary', class: 'xs', class1: '' },
  { id: 2, src1: "../../../assets/images/faces/5.jpg", color: 'secondary', class: 'sm', class1: '' },
  { id: 3, src1: "../../../assets/images/faces/8.jpg", color: 'warning', class: '', class1: '' },
  { id: 4, src1: "../../../assets/images/faces/11.jpg", color: 'danger', class: 'md', class1: '' },
  { id: 5, src1: "../../../assets/images/faces/13.jpg", color: 'info', class: 'lg', class1: '' },
  { id: 6, src1: "../../../assets/images/faces/15.jpg", color: 'dark', class: 'xl', 
    class1: 'text-muted' },
];
`

export const reactalert17 = `
const Alerts = () => {
    const [additionalcontentalert, setadditionalcontentalert] = useState(Additionalcontentalerts);
    const handleRemove7 = (id) => {
        const newList = additionalcontentalert.filter((list) => list.id !== id);
        setadditionalcontentalert(newList);
    };
    return (
        <Fragment>
              {additionalcontentalert.map((idx) => (
                <Col xl={6} key={Math.random()}>
                    <Alert variant={idx.class} className="alert  overflow-hidden p-0" role="alert">
                        <div className={'p-3 bg-$#38{idx.class} text-fixed-white d-flex justify-content-between'}>
                            <h6 className="aletr-heading mb-0 text-fixed-white">
                              {idx.text1}
                            </h6>
                            <Button type="button" variant='' className="btn-close p-0 text-fixed-white"
                              onClick={() => handleRemove7(idx.id)} data-bs-dismiss="alert" aria-label="Close"><i className="bi bi-x"></i></Button>
                        </div>
                        <hr className="my-0" />
                        <div className="p-3">
                            <p className="mb-0">{idx.text2}
                               <Link to="#" className="fw-semibold text-decoration-underline">
                                  {idx.text3}
                                </Link>
                            </p>
                        </div>
                    </Alert>
                 </Col>
              ))}
        </Fragment>
    );
};
export default Alerts;`
export const dataalert17 = `
interface alert17 {
    id: number
    text1: string
    text2: string
    text3: string
    class: string
}
export const Additionalcontentalerts = [
  { 
    id: 1, text1: "Thank you for reporting this.", 
    text2: 'We appreciate you to let us know the bug in the template and for warning us about future consequences ',
    text3: 'Visit for support for queries ?', class: "primary"
  },
  { 
    id: 2, text1: "Thank you for reporting this.", 
    text2: 'We appreciate you to let us know the bug in the template and for warning us about future consequences ', 
    text3: 'Visit for support for queries ?', class: "info" 
  },
  { id: 3, text1: "Thank you for reporting this.", 
   text2: 'We appreciate you to let us know the bug in the template and for warning us about future consequences ', 
   text3: 'Visit for support for queries ?', class: "success" 
 },
  { id: 4, text1: "Thank you for reporting this.", 
   text2: 'We appreciate you to let us know the bug in the template and for warning us about future consequences ', 
   text3: 'Visit for support for queries ?', class: "warning" 
 }
];
`

export const reactavatars1 = `<span className="avatar me-3 avatar-lg avatar-radius-0">
    <img src={face4} alt="img" />
</span>
<span className="avatar me-3 avatar-lg">
    <img src={face5} alt="img" />
</span>
<span className="avatar me-3 avatar-lg avatar-rounded">
    <img src={face6} alt="img" />
</span>`

export const reactavatars2 = `<span className="avatar avatar-xs me-2">
    <img src={face7} alt="img" />
</span>
<span className="avatar avatar-sm me-2">
    <img src={face8} alt="img" />
</span>
<span className="avatar avatar-md me-2">
    <img src={face10} alt="img" />
</span>
<span className="avatar avatar-lg me-2">
    <img src={face9} alt="img" />
</span>
<span className="avatar avatar-xl me-2">
    <img src={face1} alt="img" />
</span>
<span className="avatar avatar-xxl me-2">
    <img src={face2} alt="img" />
</span>
`
export const reactavatars3 = ` <span className="avatar avatar-xs me-2 avatar-rounded">
    <img src={face3} alt="img" />
    <Link to="#" aria-label="anchor" className="badge bg-success rounded-pill avatar-badge"><i className="fe fe-camera"></i></Link>
</span>
<span className="avatar avatar-sm me-2 avatar-rounded">
    <img src={face14} alt="img" />
    <Link  to="#" aria-label="anchor" className="badge rounded-pill bg-secondary avatar-badge"><i className="fe fe-edit"></i></Link>
</span>
<span className="avatar avatar-md me-2 avatar-rounded">
    <img src={face13} alt="img" />
    <Link to="#" aria-label="anchor" className="badge rounded-pill bg-warning avatar-badge"><i className="fe fe-plus"></i></Link>
</span>
<span className="avatar avatar-lg me-2 avatar-rounded">
    <img src={face15} alt="img" />
    <Link to="#" aria-label="anchor" className="badge rounded-pill bg-info avatar-badge"><i className="fe fe-edit"></i></Link>
</span>
<span className="avatar avatar-xl me-2 avatar-rounded">
    <img src={face13} alt="img" />
    <Link to="#" aria-label="anchor" className="badge rounded-pill bg-success avatar-badge"><i className="fe fe-camera"></i></Link>
</span>
<span className="avatar avatar-xxl me-2 avatar-rounded">
    <img src={face12} alt="img" />
    <Link to="#" aria-label="anchor" className="badge rounded-pill bg-danger avatar-badge"><i className="fe fe-plus"></i></Link>
</span>`
export const reactavatars4 = ` <span className="avatar avatar-xs me-2 online avatar-rounded">
    <img src={face1} alt="img" />
</span>
<span className="avatar avatar-sm online me-2 avatar-rounded">
    <img src={face15} alt="img" />
</span>
<span className="avatar avatar-md me-2 online avatar-rounded">
    <img src={face12} alt="img" />
</span>
<span className="avatar avatar-lg me-2 online avatar-rounded">
    <img src={face9} alt="img" />
</span>
<span className="avatar avatar-xl me-2 online avatar-rounded">
    <img src={face5} alt="img" />
</span>
<span className="avatar avatar-xxl me-2 online avatar-rounded">
    <img src={face14} alt="img" />
</span>
    `
export const reactavatars5 = ` <span className="avatar avatar-xs me-2 offline avatar-rounded">
    <img src={face15} alt="img" />
</span>
<span className="avatar avatar-sm offline me-2 avatar-rounded">
    <img src={face1} alt="img" />
</span>
<span className="avatar avatar-md me-2 offline avatar-rounded">
    <img src={face2} alt="img" />
</span>
<span className="avatar avatar-lg me-2 offline avatar-rounded">
    <img src={face3} alt="img" />
</span>
<span className="avatar avatar-xl me-2 offline avatar-rounded">
    <img src={face4} alt="img" />
</span>
<span className="avatar avatar-xxl me-2 offline avatar-rounded">
    <img src={face5} alt="img" />
</span>
                              `
export const reactavatars6 = ` <span className="avatar avatar-xs me-2 avatar-rounded">
    <img src={face6} alt="img" />
    <span className="badge rounded-pill bg-primary avatar-badge">2</span>
</span>
<span className="avatar avatar-sm me-2 avatar-rounded">
    <img src={face7} alt="img" />
    <span className="badge rounded-pill bg-secondary avatar-badge">5</span>
</span>
<span className="avatar avatar-md me-2 avatar-rounded">
    <img src={face8} alt="img" />
    <span className="badge rounded-pill bg-warning avatar-badge">1</span>
</span>
<span className="avatar avatar-lg me-2 avatar-rounded">
    <img src={face9} alt="img" />
    <span className="badge rounded-pill bg-info avatar-badge">7</span>
</span>
<span className="avatar avatar-xl me-2 avatar-rounded">
    <img src={face10} alt="img" />
    <span className="badge rounded-pill bg-success avatar-badge">3</span>
</span>
<span className="avatar avatar-xxl me-2 avatar-rounded">
    <img src={face12} alt="img" />
    <span className="badge rounded-pill bg-danger avatar-badge">9</span>
</span>`
export const reactavatars7 = `<span className="avatar avatar-xs m-2 bg-primary">
    xs
</span>
<span className="avatar avatar-sm m-2 bg-secondary">
    SM
</span>
<span className="avatar avatar-md m-2 bg-warning">
    MD
</span>
<span className="avatar avatar-lg m-2 bg-danger">
    LG
</span>
<span className="avatar avatar-xl m-2 bg-success">
    XL
</span>
<span className="avatar avatar-xxl m-2 bg-info">
    XXL
</span>`
export const reactavatars8 = ` <div className="avatar-list-stacked">
    <span className="avatar">
        <img src={face13} alt="img" />
    </span>
    <span className="avatar">
        <img src={face14} alt="img" />
    </span>
    <span className="avatar">
        <img src={face15} alt="img" />
    </span>
    <span className="avatar">
        <img src={face1} alt="img" />
    </span>
    <span className="avatar">
        <img src={face2} alt="img" />
    </span>
    <span className="avatar">
        <img src={face3} alt="img" />
    </span>
    <Link to="#" className="avatar bg-primary text-fixed-white" >
        +8
    </Link>
</div>`
export const reactavatars9 = ` <div className="avatar-list-stacked">
    <span className="avatar avatar-rounded">
        <img src={face3} alt="img" />
    </span>
    <span className="avatar avatar-rounded">
        <img src={face4} alt="img" />
    </span>
    <span className="avatar avatar-rounded">
        <img src={face5} alt="img" />
    </span>
    <span className="avatar avatar-rounded">
        <img src={face6} alt="img" />
    </span>
    <span className="avatar avatar-rounded">
        <img src={face7} alt="img" />
    </span>
    <span className="avatar avatar-rounded">
        <img src={face8} alt="img" />
    </span>
    <Link to="#" className="avatar bg-primary avatar-rounded text-fixed-white" >
        +8
    </Link>
</div>`

export const reactbreadcrumb1 = `<nav aria-label="breadcrumb">
     <Breadcrumb>
         <Breadcrumb.Item active  aria-current="page">Home</Breadcrumb.Item>
     </Breadcrumb>
 </nav>

 <nav aria-label="breadcrumb">
     <Breadcrumb>
         <Breadcrumb.Item><Link >Home</Link></Breadcrumb.Item>
         <Breadcrumb.Item active aria-current="page">Library</Breadcrumb.Item>
     </Breadcrumb>
 </nav>

 <nav aria-label="breadcrumb">
     <Breadcrumb className="mb-0">
         <Breadcrumb.Item><Link to="#">Home</Link></Breadcrumb.Item>
         <Breadcrumb.Item><Link to="#">Library</Link></Breadcrumb.Item>
         <Breadcrumb.Item active  aria-current="page">Data</Breadcrumb.Item>
     </Breadcrumb>
 </nav>`
export const reactbreadcrumb2 = `<nav aria-label="breadcrumb">
<Breadcrumb className="breadcrumb-example1">
    <Breadcrumb.Item active  aria-current="page">Home</Breadcrumb.Item>
</Breadcrumb>
</nav>

<nav aria-label="breadcrumb">
<Breadcrumb className="breadcrumb-example1">
    <Breadcrumb.Item><Link to="#" >Home</Link></Breadcrumb.Item>
    <Breadcrumb.Item active  aria-current="page">Library</Breadcrumb.Item>
</Breadcrumb>
</nav>

<nav aria-label="breadcrumb">
<Breadcrumb className="breadcrumb-example1 mb-0">
    <Breadcrumb.Item><Link to="#" >Home</Link></Breadcrumb.Item>
    <Breadcrumb.Item><Link to="#" >Library</Link></Breadcrumb.Item>
    <Breadcrumb.Item active  aria-current="page">Data</Breadcrumb.Item>
</Breadcrumb>
</nav>`
export const reactbreadcrumb3 = ` <nav 
 aria-label="breadcrumb">
    <Breadcrumb className="mb-0">
        <Breadcrumb.Item><Link to="#">Home</Link></Breadcrumb.Item>
        <Breadcrumb.Item active className="active" aria-current="page">Library</Breadcrumb.Item>
    </Breadcrumb>
</nav>`
export const reactbreadcrumb4 = `<nav 
    aria-label="breadcrumb">
    <Breadcrumb className=" mb-0">
        <Breadcrumb.Item><Link to="#">Home</Link></Breadcrumb.Item>
        <Breadcrumb.Item active className="active embedded-breadcrumb" aria-current="page">
           Library
        </Breadcrumb.Item>
    </Breadcrumb>
</nav>`
export const reactbreadcrumb5 = `<nav aria-label="breadcrumb">
 <Breadcrumb className="breadcrumb breadcrumb-style1 mb-0">
     <Breadcrumb.Item><Link to="#">Home</Link></Breadcrumb.Item>
     <Breadcrumb.Item><Link to="#">Library</Link></Breadcrumb.Item>
     <Breadcrumb.Item active className="active" aria-current="page">Data</Breadcrumb.Item>
 </Breadcrumb>
 </nav>`
export const reactbreadcrumb6 = `<nav aria-label="breadcrumb">
    <Breadcrumb className="breadcrumb breadcrumb-style2 mb-0">
        <Breadcrumb.Item>
          <Link to="#"><i className="ti ti-home-2 me-1 fs-15 d-inline-block"></i>Home</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
           <Link to="#"><i className="ti ti-apps me-1 fs-15 d-inline-block"></i>About</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item active className="active" aria-current="page">Services</Breadcrumb.Item>
    </Breadcrumb>
</nav>`
export const reactbreadcrumb7 = `<nav aria-label="breadcrumb">
    <Breadcrumb className="breadcrumb mb-0">
        <Breadcrumb.Item><Link to="#">Home</Link></Breadcrumb.Item>
        <Breadcrumb.Item active className="active" aria-current="page">Library</Breadcrumb.Item>
    </Breadcrumb>
</nav>`


export const button1 = `{DefaultButtons.map((idx)=>(
    <Button variant={idx.class} type="button" className="btn-wave">{idx.text}</Button>
    ))}`
export const databutton1 = `
interface button1 {
    id: number
    class: string
    text: string
}
export const DefaultButtons = [
    { id: 1, class: 'primary', text: ' Primary' },
    { id: 2, class: 'secondary', text: '  Secondary' },
    { id: 3, class: 'success', text: ' Success' },
    { id: 4, class: 'danger', text: '  Danger' },
    { id: 5, class: 'warning', text: '  Warning' },
    { id: 6, class: 'info', text: 'Info' },
    { id: 7, class: 'light', text: ' Light' },
    { id: 8, class: 'dark', text: '  Dark' },
    { id: 9, class: 'link', text: 'Link' },
  ];
`
export const button2 = `{DefaultButtons.map((idx)=>(
    <Button variant={idx.class} type="button" className="rounded-pill btn-wave">{idx.text}</Button>
    ))}`
export const databutton2 = `
interface button2 {
    id: number
    class: string
    text: string
}
export const DefaultButtons = [
    { id: 1, class: 'primary', text: ' Primary' },
    { id: 2, class: 'secondary', text: '  Secondary' },
    { id: 3, class: 'success', text: ' Success' },
    { id: 4, class: 'danger', text: '  Danger' },
    { id: 5, class: 'warning', text: '  Warning' },
    { id: 6, class: 'info', text: 'Info' },
    { id: 7, class: 'light', text: ' Light' },
    { id: 8, class: 'dark', text: '  Dark' },
    { id: 9, class: 'link', text: 'Link' },
  ];
`
export const button3 = ` {LightButtons.map((idx)=>(
    <Button type="button" variant={idx.class} className="btn btn-wave">{idx.text}</Button>
    ))}`
export const databutton3 = `
interface button3 {
    id: number
    class: string
    text: string
}
  export const LightButtons = [
    { id: 1, class: 'primary-light', text: ' Primary' },
    { id: 2, class: 'secondary-light', text: '  Secondary' },
    { id: 3, class: 'success-light', text: ' Success' },
    { id: 4, class: 'danger-light', text: '  Danger' },
    { id: 5, class: 'warning-light', text: '  Warning' },
    { id: 6, class: 'info-light', text: 'Info' },
    { id: 7, class: 'purple-light', text: ' purple' },
    { id: 8, class: 'teal-light', text: '  teal' },
    { id: 9, class: 'orange-light', text: 'orange' },
  ];
`
export const button4 = ` {LightButtons.map((idx)=>(
    <Button type="button" variant={idx.class} className="btn rounded-pill btn-wave">{idx.text}</Button>
    ))}`
export const databutton4 = `
interface button4 {
    id: number
    class: string
    text: string
}
  export const LightButtons = [
    { id: 1, class: 'primary-light', text: ' Primary' },
    { id: 2, class: 'secondary-light', text: '  Secondary' },
    { id: 3, class: 'success-light', text: ' Success' },
    { id: 4, class: 'danger-light', text: '  Danger' },
    { id: 5, class: 'warning-light', text: '  Warning' },
    { id: 6, class: 'info-light', text: 'Info' },
    { id: 7, class: 'purple-light', text: ' purple' },
    { id: 8, class: 'teal-light', text: '  teal' },
    { id: 9, class: 'orange-light', text: 'orange' },
  ];
`
export const button5 = `{OutlineButtons.map((idx)=>(
    <Button type="button" variant={idx.class} className="btn  btn-wave">{idx.text}</Button>
    ))}`
export const databutton5 = `
interface button5 {
    id: number
    class: string
    text: string
}
export const OutlineButtons= [
  { id: 1, class: 'outline-primary', text: ' Primary' },
  { id: 2, class: 'outline-secondary', text: '  Secondary' },
  { id: 3, class: 'outline-success', text: ' Success' },
  { id: 4, class: 'outline-danger', text: '  Danger' },
  { id: 5, class: 'outline-warning', text: '  Warning' },
  { id: 6, class: 'outline-info', text: 'Info' },
  { id: 7, class: 'outline-light', text: ' Light' },
  { id: 8, class: 'outline-dark', text: '  Dark' },
];
    `
export const button6 = ` {OutlineButtons.map((idx)=>(
   <Button type="button" variant={idx.class} className="btn rounded-pill  btn-wave">{idx.text}</Button>
   ))}`
export const databutton6 = `
interface button6 {
    id: number
    class: string
    text: string
}
export const OutlineButtons= [
  { id: 1, class: 'outline-primary', text: ' Primary' },
  { id: 2, class: 'outline-secondary', text: '  Secondary' },
  { id: 3, class: 'outline-success', text: ' Success' },
  { id: 4, class: 'outline-danger', text: '  Danger' },
  { id: 5, class: 'outline-warning', text: '  Warning' },
  { id: 6, class: 'outline-info', text: 'Info' },
  { id: 7, class: 'outline-light', text: ' Light' },
  { id: 8, class: 'outline-dark', text: '  Dark' },
];
    `
export const button7 = `{GradientButtons.map((idx)=>(
   <Button type="button" variant={idx.class} className="btn btn-wave">{idx.text}</Button>
   ))}`
export const databutton7 = `
interface button7 {
    id: number
    class: string
    text: string
}
export const GradientButtons= [
  { id: 1, class: 'primary-gradient', text: 'Primary' },
  { id: 2, class: 'secondary-gradient', text: 'Secondary' },
  { id: 3, class: 'success-gradient', text: 'Success' },
  { id: 4, class: 'danger-gradient', text: 'Danger' },
  { id: 5, class: 'warning-gradient', text: 'Warning' },
  { id: 6, class: 'info-gradient', text: 'Info' },
  { id: 7, class: 'orange-gradient', text: ' Orange' },
  { id: 8, class: 'purple-gradient', text: 'Purple' },
  { id: 8, class: 'teal-gradient', text: '  teal' },
];
    `
export const button8 = `{GradientButtons.map((idx)=>(
   <Button type="button" variant={idx.class} className="btn rounded-pill btn-wave">{idx.text}</Button>
   ))}`
export const databutton8 = `
interface button8 {
    id: number
    class: string
    text: string
}
export const GradientButtons= [
  { id: 1, class: 'primary-gradient', text: 'Primary' },
  { id: 2, class: 'secondary-gradient', text: 'Secondary' },
  { id: 3, class: 'success-gradient', text: 'Success' },
  { id: 4, class: 'danger-gradient', text: 'Danger' },
  { id: 5, class: 'warning-gradient', text: 'Warning' },
  { id: 6, class: 'info-gradient', text: 'Info' },
  { id: 7, class: 'orange-gradient', text: ' Orange' },
  { id: 8, class: 'purple-gradient', text: 'Purple' },
  { id: 8, class: 'teal-gradient', text: '  teal' },
];
       `
export const button9 = ` {GhostButtons.map((idx)=>(
   <Button type="button" variant={idx.class} className="btn btn-wave">{idx.text}</Button>
   ))}`
export const databutton9 = `
interface button8 {
    id: number
    class: string
    text: string
}
 export const GhostButtons= [
    { id: 1, class: 'primary-ghost', text: 'Primary' },
    { id: 2, class: 'secondary-ghost', text: 'Secondary' },
    { id: 3, class: 'success-ghost', text: 'Success' },
    { id: 4, class: 'danger-ghost', text: 'Danger' },
    { id: 5, class: 'warning-ghost', text: 'Warning' },
    { id: 6, class: 'info-ghost', text: 'Info' },
    { id: 7, class: 'orange-ghost', text: ' Orange' },
    { id: 8, class: 'purple-ghost', text: 'Purple' },
    { id: 8, class: 'teal-ghost', text: '  teal' },
  ];`
export const button10 = `<div className="btn-list">
    <Button variant='primary' className="btn  btn-wave" role="button">Link</Button>
    <Button variant='secondary' className="btn  btn-wave" type="submit">Button</Button>
    <Button variant='info' as="input" className="btn " type="button" value="Input" />
    <Button variant='warning' as="input" className="btn" type="submit" value="Submit" />
    <Button variant='success' as="input" className="btn " type="reset" value="Reset" />
</div>`
export const button11 = `<div className="btn-list">
    <div className="mb-4">
        <Button type="button" variant='primary' className="btn btn-primary" disabled>
           Primary button
        </Button> 
        <Button type="button" variant='secondary' className="btn btn-secondary" disabled>
            Button
        </Button>
        <Button type="button" variant='outline-primary' className="btn btn-outline-primary"
          disabled>
           Primary button
        </Button>
        <Button type="button" variant='outline-secondary' className="btn btn-outline-secondary"
          disabled>
          Button
        </Button>
    </div>
    <div>
        <Button variant='primary' className="btn disabled" role="button">
          Primary link
        </Button>
        <Button variant='secondary' className="btn disabled" role="button">
           Link
        </Button>
    </div>
</div>`
export const button12 = ` <div className="btn-list">
    <div className="mb-4">
        <Button type="button" variant='primary' className="btn btn-wave">
            Toggle button
        </Button>
        <Button type="button" variant='secondary' active className="btn  btn-wave">
            Active toggle button
        </Button>
        <Button type="button" variant='teal' className="btn btn-wave" disabled>
            Disabled toggle button
        </Button>
    </div>
    <div>
        <Button variant='primary' className="btn btn-wave" role="button" >
            Toggle link
        </Button>
        <Button variant='secondary' active className="btn btn-wave" role="button">
            Active toggle link
        </Button>
        <Button variant='teal' className="btn  btn-wave" role="button" disabled>
            Disabled toggle link
        </Button>
    </div>
</div>`
export const button13 = ` <div className="btn-list">
    <Button variant='primary' disabled className="btn" tabIndex={-1} role="button">
        Primary link
    </Button>
    <Button variant='secondary' disabled className="btn" tabIndex={-1} role="button">
        Link
    </Button>
</div>`
export const button14 = `<div className="btn-list d-md-flex flex-wrap">
    <Button variant='primary' className="btn  btn-loader">
        <span className="me-2">Loading</span>
        <span className="loading"><i className="ri-loader-2-fill fs-16"></i></span>
    </Button>
    <Button variant='outline-secondary' className="btn btn-loader">
        <span className="me-2">Loading</span>
        <span className="loading"><i className="ri-loader-2-fill fs-16"></i></span>
    </Button>
    <Button variant='info-transparent' className="btn  btn-loader">
        <span className="me-2">Loading</span>
        <span className="loading"><i className="ri-loader-4-line fs-16"></i></span>
    </Button>
    <Button variant='warning-transparent' className="btn  btn-loader">
        <span className="me-2">Loading</span>
        <span className="loading"><i className="ri-loader-5-line fs-16"></i></span>
    </Button>
    <Button variant='success' className="btn btn-loader" disabled>
        <span className="me-2">Disabled</span>
        <span className="loading"><i className="ri-refresh-line fs-16"></i></span>
    </Button>
</div>`
export const button15 = `<div className="btn-list d-md-flex d-block">
    <div className="mb-md-0 mb-2">
        <Button variant="primary" className="btn btn-icon  btn-wave">
            <i className="ri-bank-fill"></i>
        </Button>
        <Button variant="info" className="btn btn-icon  btn-wave">
            <i className="ri-medal-line"></i>
        </Button>
        <Button variant="danger" className="btn btn-icon  btn-wave">
            <i className="ri-archive-line"></i>
        </Button>
        <Button variant="warning" className="btn btn-icon  btn-wave me-5">
            <i className="ri-calendar-2-line"></i>
        </Button>
    </div>
    <div className="mb-md-0 mb-2">
        <Button variant="primary-transparent" className="btn btn-icon rounded-pill btn-wave">
            <i className="ri-home-smile-line"></i>
        </Button>
        <Button variant="secondary-transparent" className="btn btn-icon  rounded-pill btn-wave">
            <i className="ri-delete-bin-line"></i>
        </Button>
        <Button variant="success-transparent" className="btn btn-icon  rounded-pill btn-wave">
            <i className="ri-notification-3-line"></i>
        </Button>
        <Button variant="danger-transparent" className="btn btn-icon  rounded-pill btn-wave me-5">
            <i className="ri-chat-settings-line"></i>
        </Button>
    </div>
    <div className="">
        <Button variant="outline-primary" className="btn btn-icon  rounded-pill btn-wave">
            <i className="ri-phone-line"></i>
        </Button>
        <Button variant="outline-teal" className="btn btn-icon  rounded-pill btn-wave">
            <i className="ri-customer-service-2-line"></i>
        </Button>
        <Button variant="outline-success" className="btn btn-icon  rounded-pill btn-wave">
            <i className="ri-live-line"></i>
        </Button>
        <Button variant="outline-secondary" className="btn btn-icon  rounded-pill btn-wave">
            <i className="ri-save-line"></i>
        </Button>
    </div>
</div>`
export const button16 = `{SocialIconButtons.map((idx) => (
    <Button variant={idx.class} className="btn btn-icon btn-wave" key={Math.random()}>
        <i className={'ri-$#38{idx.class}-line'}></i>
    </Button>
))}`
export const databutton16 = `
interface alert16 {
	id: number
	class: string
}
 export const SocialIconButtons= [
    { id: 1, class: 'facebook' },
    { id: 2, class: 'twitter' },
    { id: 3, class: 'instagram' },
    { id: 4, class: 'github' },
    { id: 5, class: 'youtube' },
    { id: 5, class: 'google' },
  
  ];`
export const button17 = `<div className="btn-list">
    <Button type="button" variant='primary' className="btn  btn-sm btn-wave">
        Small button
    </Button>
    <Button type="button" variant='secondary' className="btn  btn-wave">
        Default button
    </Button>
    <Button type="button" variant='success' className="btn  btn-lg btn-wave">
        Large button
    </Button>
</div>`
export const button18 = ` <div className="btn-list">
    <Button type="button" variant='primary' className="btn btn-w-xs btn-wave">XS</Button>
    <Button type="button" variant='secondary' className="btn btn-w-sm btn-wave">SM</Button>
    <Button type="button" variant='warning' className="btn btn-w-md btn-wave">MD</Button>
    <Button type="button" variant='info' className="btn btn-w-lg btn-wave">LG</Button>
</div>`
export const button19 = ` <div className="me-5">
    <Button variant='primary' className="btn  shadow-sm btn-wave">Button</Button>
    <Button variant='primary' className="btn btn-primary shadow btn-wave">Button</Button>
    <Button variant='primary' className="btn btn-primary shadow-lg btn-wave">Button</Button>
   </div>
   <div>
    <Button variant='secondary' className="btn  btn-sm shadow-sm btn-wave">Button</Button>
    <Button variant='info' className="btn  shadow btn-wave">Button</Button>
    <Button variant='success' className="btn btn-lg  shadow-lg btn-wave">Button</Button>
</div>`
export const button20 = ` <div className="btn-list">
    {ColoredButtons.map((idx) => (
        <Button variant={idx.class} className={'btn shadow-$#38{idx.class} btn-wave'}
           key={Math.random()}>
         Button
        </Button>
    ))}
</div>`
export const databutton20 = `
interface alert20 {
	id: number
	class: string
}
export const ColoredButtons = [
    { id: 1, class: 'primary' },
    { id: 2, class: 'secondary' },
    { id: 3, class: 'success' },
    { id: 4, class: 'info' },
    { id: 5, class: 'warning' },
    { id: 6, class: 'danger' },
    { id: 6, class: 'purple' },
    { id: 6, class: 'orange' },
  
  ];`
export const button21 = `{ColoredButtons.map((idx)=>(
   <Button variant={idx.class} className="btn  btn-raised-shadow btn-wave" 
     key={Math.random()}>Button</Button>
))} `
export const databutton21 = `
   interface alert21 {
       id: number
       class: string
   }
export const ColoredButtons = [
  { id: 1, class: 'primary' },
  { id: 2, class: 'secondary' },
  { id: 3, class: 'success' },
  { id: 4, class: 'info' },
  { id: 5, class: 'warning' },
  { id: 6, class: 'danger' },
  { id: 6, class: 'purple' },
  { id: 6, class: 'orange' },

];`
export const button22 = `<div className="btn-list">
    <Button className="btn btn-primary label-btn">
        <i className="ri-chat-smile-line label-btn-icon me-2"></i>
        Primary
    </Button>
    <Button className="btn btn-secondary label-btn">
        <i className="ri-settings-4-line label-btn-icon me-2"></i>
        Secondary
    </Button>
    <Button className="btn btn-warning label-btn rounded-pill">
        <i className="ri-spam-2-line label-btn-icon me-2 rounded-pill"></i>
        Warning
    </Button>
    <Button className="btn btn-info label-btn rounded-pill">
        <i className="ri-phone-line label-btn-icon me-2 rounded-pill"></i>
        Info
    </Button>
    <Button className="btn btn-success label-btn label-end">
        Success
        <i className="ri-thumb-up-line label-btn-icon ms-2"></i>
    </Button>
    <Button className="btn btn-danger label-btn label-end rounded-pill">
        Cancel
        <i className="ri-close-line label-btn-icon ms-2 rounded-pill"></i>
    </Button>
</div>`
export const button23 = `<div className="btn-list">
    <Button variant='info' className="btn  custom-button rounded-pill">
        <span className="custom-btn-icons"><i className="ri-twitter-x-line text-info"></i></span>
        Twitter
    </Button>
    <Button variant='teal-light' className="btn  btn-border-down">Border</Button>
    <Button variant='secondary-light' className="btn  btn-border-start">Border</Button>
    <Button variant='purple-light' className="btn  btn-border-end">Border</Button>
    <Button variant='warning-light' className="btn  btn-border-top">Border</Button>
    <Button variant='secondary' className="btn  btn-glare"><span>Glare Button</span></Button>
    <Button variant='danger' className="btn  btn-hover btn-hover-animate">Like</Button>
    <Button variant='success' className="btn  btn-darken-hover">Hover</Button>
    <Button variant='orange' className="btn  btn-custom-border">Hover</Button>
</div>`
export const button24 = `<div className="btn-list">
    <div className="d-grid gap-2 mb-4">
        <Button variant='primary' className="btn  btn-wave" type="button">Button</Button>
        <Button variant='secondary' className="btn  btn-wave" type="button">Button</Button>
    </div>
    <div className="d-grid gap-2 d-md-block">
        <Button variant='info' className="btn  btn-wave" type="button">Button</Button>
        <Button variant='success' className="btn  btn-wave" type="button">Button</Button>
    </div>
    <div className="d-grid gap-2 col-6 mx-auto">
        <Button variant='danger' className="btn  btn-wave" type="button">Button</Button>
        <Button variant='warning' className="btn  btn-wave" type="button">Button</Button>
    </div>
    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
        <Button variant='teal' className="btn me-md-2 btn-wave" type="button">Button</Button>
        <Button variant='purple' className="btn  btn-wave" type="button">Button</Button>
    </div>
</div>`


export const buttongroup1 = `<ButtonGroup className="btn-group" role="group" aria-label="Basic example">
    <Button variant="info" type="button" 
      className="btn btn-wave">
     <i className="bi bi-skip-backward"></i>
    </Button>
    <Button variant="info" type="button" 
     className="btn btn-wave">
         <i className="bi bi-pause"></i>
    </Button>
    <Button variant="info" type="button" 
     className="btn btn-wave">
     <i className="bi bi-skip-forward"></i>
    </Button>
</ButtonGroup>`
export const Buttongroup2 = `<ButtonGroup className="btn-group">
    <Button variant='primary' active 
      className="btn  active btn-wave" 
        aria-current="page">
       Active link
    </Button>
    <Button variant='primary' 
      className="btn">
        Link
    </Button>
    <Button variant='primary' 
       className="btn ">
        Link
    </Button>
</ButtonGroup>`
export const ButtonGroup3 = `<ButtonGroup className="btn-group" role="group" aria-label="Basic mixed styles example">
    <Button variant="danger" type="button" 
      className="btn btn-wave">
        Left
    </Button>
    <Button variant="warning" type="button" 
       className="btn btn-wave">
       Middle
    </Button>
    <Button variant="success" type="button" 
      className="btn btn-wave">
        Right
    </Button>
</ButtonGroup>`
export const ButtonGroup4 = `  <ButtonGroup className="btn-group" role="group" aria-label="Basic outlined example">
    <Button variant="outline-primary"
     type="button" 
      className="btn btn-wave">
         Left
    </Button>
    <Button variant="outline-primary"
     type="button" 
      className="btn btn-wave">
       Middle
    </Button>
    <Button variant="outline-primary"
     type="button" 
      className="btn btn-wave">
       Right
    </Button>
</ButtonGroup>`
export const ButtonGroup5 = ` <ButtonGroup className="btn-group" role="group" aria-label="Basic checkbox toggle button group">
    <input type="checkbox" className="btn-check" id="btncheck1" />
    <label className="btn btn-outline-primary" htmlFor="btncheck1">Checkbox 1</label>
    <input type="checkbox" className="btn-check" id="btncheck2" />
    <label className="btn btn-outline-primary" htmlFor="btncheck2">Checkbox 2</label>
    <input type="checkbox" className="btn-check" id="btncheck3" />
    <label className="btn btn-outline-primary" htmlFor="btncheck3">Checkbox 3</label>
</ButtonGroup>`
export const ButtonGroup6 = ` <ButtonGroup className="btn-group" role="group" aria-label="Basic radio toggle button group">
    <input type="radio" className="btn-check" name="btnradio" id="btnradio1" defaultChecked />
    <label className="btn btn-outline-primary" htmlFor="btnradio1">Radio 1</label>
    <input type="radio" className="btn-check" name="btnradio" id="btnradio2"/>
    <label className="btn btn-outline-primary" htmlFor="btnradio2">Radio 2</label>
    <input type="radio" className="btn-check" name="btnradio" id="btnradio3"/>
    <label className="btn btn-outline-primary" htmlFor="btnradio3">Radio 3</label>
</ButtonGroup>`
export const ButtonGroup7 = ` <ButtonGroup className="btn-group btn-group-lg my-1 me-1" role="group" aria-label="Large button group">
    <Button variant="outline-success" type="button" className="btn">Left</Button>
    <Button variant="outline-success" type="button" className="btn">Middle</Button>
    <Button variant="outline-success" type="button" className="btn">Right</Button>
</ButtonGroup>
<ButtonGroup className="btn-group my-1 me-1" role="group" aria-label="Default button group">
    <Button variant="outline-success" type="button" className="btn">Left</Button>
    <Button variant="outline-success" type="button" className="btn">Middle</Button>
    <Button variant="outline-success" type="button" className="btn">Right</Button>
</ButtonGroup>
<ButtonGroup className="btn-group btn-group-sm my-1 me-1" role="group" aria-label="Small button group">
    <Button variant="outline-success" type="button" className="btn">Left</Button>
    <Button variant="outline-success" type="button" className="btn">Middle</Button>
    <Button variant="outline-success" type="button" className="btn">Right</Button>
</ButtonGroup>`
export const ButtonGroup8 = ` <ButtonToolbar className="mb-4" role="toolbar"
    aria-label="Toolbar with button groups">
    <ButtonGroup className="btn-group me-2 my-1" role="group" aria-label="First group">
        <Button variant="primary" type="button" className="btn">1</Button>
        <Button variant="primary" type="button" className="btn">2</Button>
        <Button variant="primary" type="button" className="btn">3</Button>
        <Button variant="primary" type="button" className="btn">4</Button>
    </ButtonGroup>
    <ButtonGroup className="btn-group me-2 my-1" role="group" aria-label="Second group">
        <Button variant="secondary" type="button" className="btn">5</Button>
        <Button variant="secondary" type="button" className="btn">6</Button>
        <Button variant="secondary" type="button" className="btn">7</Button>
    </ButtonGroup>
    <ButtonGroup className="btn-group my-1" role="group" aria-label="Third group">
        <Button variant="info" type="button" className="btn btn-info">8</Button>
    </ButtonGroup>
</ButtonToolbar>
<ButtonToolbar className="mb-3" role="toolbar"
    aria-label="Toolbar with button groups">
    <ButtonGroup className="btn-group me-2 my-1" role="group" aria-label="First group">
        <Button variant="outline-secondary" type="button" className="btn">1</Button>
        <Button variant="outline-secondary" type="button" className="btn">2</Button>
        <Button variant="outline-secondary" type="button" className="btn">3</Button>
        <Button variant="outline-secondary" type="button" className="btn">4</Button>
    </ButtonGroup>
    <InputGroup>
        <InputGroup.Text id="btnGroupAddon">@</InputGroup.Text>
        <Form.Control type="text"
            placeholder="Input group example"
            aria-label="Input group example"
            aria-describedby="btnGroupAddon" />
    </InputGroup>
</ButtonToolbar>
<ButtonToolbar className="justify-content-between" role="toolbar"
    aria-label="Toolbar with button groups">
    <ButtonGroup className="btn-group my-1" role="group" aria-label="First group">
        <Button variant="outline-secondary" type="button" className="btn">1</Button>
        <Button variant="outline-secondary" type="button" className="btn">2</Button>
        <Button variant="outline-secondary" type="button" className="btn">3</Button>
        <Button variant="outline-secondary" type="button" className="btn">4</Button>
    </ButtonGroup>
    <InputGroup>
        <InputGroup.Text id="btnGroupAddon2">@</InputGroup.Text>
        <Form.Control type="text"
            placeholder="Input group example"
            aria-label="Input group example"
            aria-describedby="btnGroupAddon2" />
    </InputGroup>
</ButtonToolbar>`
export const ButtonGroup9 = `<ButtonGroup className="btn-group" role="group"
    aria-label="Button group with nested dropdown">
    <Button variant="" type="button" className="btn btn-primary">1</Button>
    <Button variant="" type="button" className="btn btn-primary">2</Button>
    <DropdownButton as={ButtonGroup} title="Dropdown" id="bg-nested-dropdown">
        <Dropdown.Item eventKey="1">Dropdown link</Dropdown.Item>
        <Dropdown.Item eventKey="2">Dropdown link</Dropdown.Item>
    </DropdownButton>
</ButtonGroup>`
export const ButtonGroup10 = `<Row className=" gap-2">
    <Col sm={3}>
        <ButtonGroup vertical role="group" aria-label="Vertical button group">
            <Button variant="primary" type="button" className="btn ">Button</Button>
            <Button variant="primary" type="button" className="btn ">Button</Button>
            <DropdownButton as={ButtonGroup} title="Dropdown" id="bg-vertical-dropdown-1">
                <Dropdown.Item eventKey="1">Dropdown link</Dropdown.Item>
                <Dropdown.Item eventKey="2">Dropdown link</Dropdown.Item>
            </DropdownButton>
            <Button variant="primary" type="button" className="btn ">Button</Button>
            <Button variant="primary" type="button" className="btn ">Button</Button>
            <DropdownButton as={ButtonGroup} title="Dropdown" id="bg-vertical-dropdown-1">
                <Dropdown.Item eventKey="1">Dropdown link</Dropdown.Item>
                <Dropdown.Item eventKey="2">Dropdown link</Dropdown.Item>
            </DropdownButton>
            <DropdownButton as={ButtonGroup} title="Dropdown" id="bg-vertical-dropdown-1">
                <Dropdown.Item eventKey="1">Dropdown link</Dropdown.Item>
                <Dropdown.Item eventKey="2">Dropdown link</Dropdown.Item>
            </DropdownButton>
            <DropdownButton as={ButtonGroup} title="Dropdown" id="bg-vertical-dropdown-1">
                <Dropdown.Item eventKey="1">Dropdown link</Dropdown.Item>
                <Dropdown.Item eventKey="2">Dropdown link</Dropdown.Item>
            </DropdownButton>
        </ButtonGroup>
    </Col>
    <Col sm={3}>
        <ButtonGroup vertical role="group" aria-label="Vertical button group">
            <Button variant="" type="button" className="btn btn-info">Button</Button>
            <Button variant="" type="button" className="btn btn-info">Button</Button>
            <Button variant="" type="button" className="btn btn-info">Button</Button>
            <Button variant="" type="button" className="btn btn-info">Button</Button>
            <Button variant="" type="button" className="btn btn-info">Button</Button>
            <Button variant="" type="button" className="btn btn-info">Button</Button>
        </ButtonGroup>
    </Col>
    <Col sm={3}>
        <ButtonGroup vertical role="group"
            aria-label="Vertical radio toggle button group">
            <input type="radio" className="btn-check" name="vbtn-radio" id="vbtn-radio1"
                defaultChecked />
            <label className="btn btn-outline-danger" htmlFor="vbtn-radio1">Radio 1</label>
            <input type="radio" className="btn-check" name="vbtn-radio" id="vbtn-radio2"
            />
            <label className="btn btn-outline-danger" htmlFor="vbtn-radio2">Radio 2</label>
            <input type="radio" className="btn-check" name="vbtn-radio" id="vbtn-radio3"
            />
            <label className="btn btn-outline-danger" htmlFor="vbtn-radio3">Radio 3</label>
        </ButtonGroup>
    </Col>
</Row>`
export const ButtonGroup11 = `<ButtonGroup className="btn-group" role="group" aria-label="Basic example">
    {SocialIconButtons.map((idx) => (
        <Button variant={idx.class} className="btn btn-icon btn-wave" key={Math.random()}>
            <i className={'ri-$#38{idx.class}-line'}></i>
        </Button>
    ))}
</ButtonGroup>`

export const dataButtonGroup11 = `
   interface ButtonGroup11 {
       id: number
       class: string
   }
export const SocialIconButtons = [
  { id: 1, class: 'facebook' },
  { id: 2, class: 'twitter' },
  { id: 3, class: 'instagram' },
  { id: 4, class: 'github' },
  { id: 5, class: 'youtube' },
  { id: 5, class: 'google' },
];`



export const badge1 = ` {badges.map((badge) => (
    <Badge key={Math.random()} bg={badge.color} 
       className={'badge bg-$#38{badge.color} $#38{badge.class}'}>
        {badge.heading}
    </Badge>
))}`
export const databadge1 = `
   interface badge1 {
       id: number
       heading: string
       color: string
       class: string
   }
export const badges = [
  { id: 1, heading: 'Primary', color: 'primary', class: '' },
  { id: 2, heading: 'secondary', color: 'secondary', class: '' },
  { id: 3, heading: 'Success', color: 'success', class: '' },
  { id: 4, heading: 'Danger', color: 'danger', class: '' },
  { id: 5, heading: 'Warning', color: 'warning', class: '' },
  { id: 6, heading: 'Info', color: 'info', class: '' },
  { id: 7, heading: 'Light', color: 'light', class: 'text-dark' },
  { id: 8, heading: 'Dark', color: 'dark', class: '' },
];`

export const badge2 = `{badges.map((badge) => (
    <Badge key={Math.random()} bg={badge.color} 
      className={'badge bg-$#38{badge.color} $#38{badge.class} rounded-pill'}>
      {badge.heading}
    </Badge>
))}`
export const databadge2 = `
   interface badge2 {
       id: number
       heading: string
       color: string
       class: string
   }
export const badges = [
  { id: 1, heading: 'Primary', color: 'primary', class: '' },
  { id: 2, heading: 'secondary', color: 'secondary', class: '' },
  { id: 3, heading: 'Success', color: 'success', class: '' },
  { id: 4, heading: 'Danger', color: 'danger', class: '' },
  { id: 5, heading: 'Warning', color: 'warning', class: '' },
  { id: 6, heading: 'Info', color: 'info', class: '' },
  { id: 7, heading: 'Light', color: 'light', class: 'text-dark' },
  { id: 8, heading: 'Dark', color: 'dark', class: '' },
];`
export const badge3 = `{badges.map((badge) => (
    <Badge key={Math.random()} bg={badge.color} 
       className={'badge bg-$#38{badge.color}-transparent $#38{badge.class}'}>
       {badge.heading}
    </Badge>
))}`
export const databadge3 = `
   interface badge3 {
       id: number
       heading: string
       color: string
       class: string
   }
export const badges = [
  { id: 1, heading: 'Primary', color: 'primary', class: '' },
  { id: 2, heading: 'secondary', color: 'secondary', class: '' },
  { id: 3, heading: 'Success', color: 'success', class: '' },
  { id: 4, heading: 'Danger', color: 'danger', class: '' },
  { id: 5, heading: 'Warning', color: 'warning', class: '' },
  { id: 6, heading: 'Info', color: 'info', class: '' },
  { id: 7, heading: 'Light', color: 'light', class: 'text-dark' },
  { id: 8, heading: 'Dark', color: 'dark', class: '' },
];`
export const badge4 = `{badges.map((badge) => (
    <Badge key={Math.random()} bg={badge.color} 
      className={'badge bg-$#38{badge.color}-transparent $#38{badge.class} rounded-pill'}>
      {badge.heading}
    </Badge>
))}`
export const databadge4 = `
   interface badge4 {
       id: number
       heading: string
       color: string
       class: string
   }
export const badges = [
  { id: 1, heading: 'Primary', color: 'primary', class: '' },
  { id: 2, heading: 'secondary', color: 'secondary', class: '' },
  { id: 3, heading: 'Success', color: 'success', class: '' },
  { id: 4, heading: 'Danger', color: 'danger', class: '' },
  { id: 5, heading: 'Warning', color: 'warning', class: '' },
  { id: 6, heading: 'Info', color: 'info', class: '' },
  { id: 7, heading: 'Light', color: 'light', class: 'text-dark' },
  { id: 8, heading: 'Dark', color: 'dark', class: '' },
];`
export const badge5 = ` {badges1.map((badge1) => (
    <Badge key={Math.random()} bg={badge1.color} 
    className={'badge bg-$#38{badge1.color}-gradient'}>
      {badge1.heading}
    </Badge>
))}`
export const databadge5 = `
   interface badge5 {
       id: number
       heading: string
       color: string
   }
  export const badges1= [
    { id: 1, heading: 'Primary', color: 'primary' },
    { id: 2, heading: 'secondary', color: 'secondary' },
    { id: 3, heading: 'Success', color: 'success' },
    { id: 4, heading: 'Danger', color: 'danger' },
    { id: 5, heading: 'Warning', color: 'warning' },
    { id: 6, heading: 'Info', color: 'info' },
    { id: 7, heading: 'orange', color: 'orange' },
    { id: 8, heading: 'purple', color: 'purple' },
  ];`
export const badge6 = `{badges1.map((badge1) => (
    <Badge key={Math.random()} bg={badge1.color} 
       className={'badge bg-$#38{badge1.color}-gradient rounded-pill'}>
       {badge1.heading}
    </Badge>
))}`
export const databadge6 = `
   interface badge5 {
       id: number
       heading: string
       color: string
   }
  export const badges1= [
    { id: 1, heading: 'Primary', color: 'primary' },
    { id: 2, heading: 'secondary', color: 'secondary' },
    { id: 3, heading: 'Success', color: 'success' },
    { id: 4, heading: 'Danger', color: 'danger' },
    { id: 5, heading: 'Warning', color: 'warning' },
    { id: 6, heading: 'Info', color: 'info' },
    { id: 7, heading: 'orange', color: 'orange' },
    { id: 8, heading: 'purple', color: 'purple' },
  ];`
export const badge7 = `{badges.map((badge) => (
    <Badge key={Math.random()} bg={'outline-$#38{badge.color}'} 
       className={'badge outline-$#38{badge.color}-transparent $#38{badge.class}'}>
       {badge.heading}
    </Badge>
))}`
export const databadge7 = `
   interface badge4 {
       id: number
       heading: string
       color: string
       class: string
   }
export const badges = [
  { id: 1, heading: 'Primary', color: 'primary', class: '' },
  { id: 2, heading: 'secondary', color: 'secondary', class: '' },
  { id: 3, heading: 'Success', color: 'success', class: '' },
  { id: 4, heading: 'Danger', color: 'danger', class: '' },
  { id: 5, heading: 'Warning', color: 'warning', class: '' },
  { id: 6, heading: 'Info', color: 'info', class: '' },
  { id: 7, heading: 'Light', color: 'light', class: 'text-dark' },
  { id: 8, heading: 'Dark', color: 'dark', class: '' },
];`
export const badge8 = ` {badges.map((badge) => (
    <Badge key={Math.random()} bg={'outline-$#38{badge.color}'} 
      className={'badge outline-$#{badge.color}-transparent $#38{badge.class} rounded-pill'}>
       {badge.heading}
    </Badge>
))}`
export const databadge8 = `
   interface badge4 {
       id: number
       heading: string
       color: string
       class: string
   }
export const badges = [
  { id: 1, heading: 'Primary', color: 'primary', class: '' },
  { id: 2, heading: 'secondary', color: 'secondary', class: '' },
  { id: 3, heading: 'Success', color: 'success', class: '' },
  { id: 4, heading: 'Danger', color: 'danger', class: '' },
  { id: 5, heading: 'Warning', color: 'warning', class: '' },
  { id: 6, heading: 'Info', color: 'info', class: '' },
  { id: 7, heading: 'Light', color: 'light', class: 'text-dark' },
  { id: 8, heading: 'Dark', color: 'dark', class: '' },
];`
export const badge9 = `<Button variant='primary' type="button" className="btn  my-1 me-2">
    Notifications <Badge bg="secondary" className="badge ms-2 ">4</Badge>
</Button>
<Button variant='secondary' type="button" className="btn  my-1 me-2">
    Notifications <Badge bg="primary" className="badge ms-2 ">7</Badge>
</Button>
<Button variant='success' type="button" className="btn  my-1 me-2">
    Notifications <Badge bg="danger" className="badge ms-2 ">12</Badge>
</Button>
<Button variant='info' type="button" className="btn  my-1 me-2">
    Notifications <Badge bg="warning" className="badge ms-2 ">32</Badge>
</Button>`
export const badge10 = `<Button variant='outline-primary' type="button" className="btn  my-1 me-2">
    Notifications <Badge bg="" className="badge ms-2">4</Badge>
</Button>
<Button variant='outline-secondary' type="button" className="btn  my-1 me-2">
    Notifications <Badge bg="" className="badge ms-2">7</Badge>
</Button>
<Button variant='outline-success' type="button" className="btn  my-1 me-2">
    Notifications <Badge bg="" className="badge ms-2">12</Badge>
</Button>
<Button variant='outline-info' type="button" className="btn  my-1 me-2">
    Notifications <Badge bg="" className="badge ms-2">32</Badge>
</Button>`
export const badge11 = ` <h1>Example heading <Badge bg="primary" className="badge">New</Badge></h1>
<h2>Example heading <Badge bg="primary" className="badge">New</Badge></h2>
<h3>Example heading <Badge bg="primary" className="badge">New</Badge></h3>
<h4>Example heading <Badge bg="primary" className="badge">New</Badge></h4>
<h5>Example heading <Badge bg="primary" className="badge">New</Badge></h5>
<h6>Example heading <Badge bg="primary" className="badge">New</Badge></h6>`

export const badge12 = `<Button variant='primary' type="button" className="btn  position-relative">
    Inbox
    <span
        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
        99+
        <span className="visually-hidden">unread messages</span>
    </span>
</Button>
<Button variant='secondary' type="button" className="btn  position-relative">
    Profile
    <span
        className="position-absolute top-0 start-100 translate-middle p-2 bg-success 
         border border-light rounded-circle">
        <span className="visually-hidden">New alerts</span>
    </span>
</Button>
<span className="avatar">
    <img src={face1} alt="img" />
    <span className="position-absolute top-0 start-100 translate-middle p-1 bg-success 
         border border-light rounded-circle">
        <span className="visually-hidden">New alerts</span>
    </span>
</span>
<span className="avatar avatar-rounded">
    <img src={face2} alt="img" />
    <span className="position-absolute top-0 start-100 translate-middle p-1 
      bg-success border border-light rounded-circle">
        <span className="visually-hidden">New alerts</span>
    </span>
</span>
<span className="avatar avatar-rounded">
    <img src={face3} alt="img" />
    <span className="position-absolute top-0 start-100 translate-middle badge 
      bg-secondary rounded-pill shadow-lg">1000+
        <span className="visually-hidden">New alerts</span>
    </span>
</span>`
export const badge13 = `<Badge bg="outline-secondary" className="badge  custom-badge fs-15 me-5 m-2"><i className="ti ti-flame me-1"></i>Hot</Badge>
<span bg="" className="icon-badge me-5 m-2">
    <svg className="icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" /></svg>
    <Badge className="badge rounded-pill bg-success">14</Badge>
</span>
<Badge bg="" className="badge border bg-light text-default custom-badge me-5 m-2"><i className="fe fe-eye me-1 d-inline-block"></i>13.2k</Badge>
<span className="text-badge me-5 m-2">
    <span className="text fs-18">Inbox</span>
    <Badge bg="success" className="badge rounded-pill bg-success">32</Badge>
</span>`





export const dropdown1 = `<div className="btn-list d-flex align-items-center flex-wrap">
    <Dropdown className="dropdown">
        <Dropdown.Toggle variant='' className="btn btn-primary dropdown-toggle" type="button"
            id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
            Dropdown button
        </Dropdown.Toggle>
        <Dropdown.Menu as="ul" className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
            <Dropdown.Item as="li" >Action</Dropdown.Item>
            <Dropdown.Item as="li" >Another action</Dropdown.Item>
            <Dropdown.Item as="li" >Something else here</Dropdown.Item>
        </Dropdown.Menu>
    </Dropdown>
    <Dropdown className="dropdown">
        <Dropdown.Toggle className="btn btn-secondary dropdown-toggle" role="button"
            id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">
            Dropdown link
        </Dropdown.Toggle>
        <Dropdown.Menu as="ul" className="dropdown-menu" aria-labelledby="dropdownMenuLink">
            <Dropdown.Item as="li" >Action</Dropdown.Item>
            <Dropdown.Item as="li" >Another action</Dropdown.Item>
            <Dropdown.Item as="li" >Something else here</Dropdown.Item>
        </Dropdown.Menu>
    </Dropdown>
</div>`
export const dropdown2 = `{SingleButtons.map((idx)=>(
  <div className="btn-group" key={Math.random()}>
    <Dropdown>
    <Dropdown.Toggle type="button" variant={idx.class} className="btn"
        data-bs-toggle="dropdown" aria-expanded="false">
        Action
    </Dropdown.Toggle>
    <Dropdown.Menu as="ul">
        <Dropdown.Item as="li" >Action</Dropdown.Item>
        <Dropdown.Item as="li" >Another action</Dropdown.Item>
        <Dropdown.Item as="li" >Something else here</Dropdown.Item>
        <li>
            <hr className="dropdown-divider"/>
        </li>
        <Dropdown.Item as="li" >Separated link</Dropdown.Item>
    </Dropdown.Menu>
    </Dropdown>
   </div>
))}`
export const datadropdown2 = `
   interface dropdown2 {
       id: number
       class: string
   }
export const SingleButtons = [
    { id: 1, class: 'primary' },
    { id: 2, class: 'secondary' },
    { id: 3, class: 'success' },
    { id: 4, class: 'info' },
    { id: 5, class: 'warning' },
    { id: 6, class: 'danger' }
  ];`
export const dropdown3 = ` {SingleButtons.map((idx)=>(
<div className="btn-group">
<Dropdown>
    <Dropdown.Toggle variant={idx.class} type="button" className="btn dropdown-toggle rounded-pill"
        data-bs-toggle="dropdown" aria-expanded="false">
        Action
    </Dropdown.Toggle>
    <Dropdown.Menu as="ul">
        <Dropdown.Item as="li" >Action</Dropdown.Item>
        <Dropdown.Item as="li" >Another action</Dropdown.Item>
        <Dropdown.Item as="li" >Something else here</Dropdown.Item>
        <li>
            <hr className="dropdown-divider"/>
        </li>
        <Dropdown.Item as="li" >Separated link</Dropdown.Item>
    </Dropdown.Menu>
    </Dropdown>
</div>
))}`
export const datadropdown3 = `
   interface dropdown3 {
       id: number
       class: string
   }
export const SingleButtons = [
    { id: 1, class: 'primary' },
    { id: 2, class: 'secondary' },
    { id: 3, class: 'success' },
    { id: 4, class: 'info' },
    { id: 5, class: 'warning' },
    { id: 6, class: 'danger' }
  ];`
export const dropdown4 = `  {OutlineButtons.map((idx)=>(
<div className="btn-group" key={Math.random()}>
    <Dropdown.Toggle variant={idx.class} type="button" className="btn  dropdown-toggle"
        data-bs-toggle="dropdown" aria-expanded="false">
        Action
    </Dropdown.Toggle>
    <Dropdown.Menu as="ul">
        <Dropdown.Item as="li" >Action</Dropdown.Item>
        <Dropdown.Item as="li" >Another action</Dropdown.Item>
        <Dropdown.Item as="li" >Something else here</Dropdown.Item>
        <li>
            <hr className="dropdown-divider"/>
        </li>
        <Dropdown.Item as="li" >Separated link</Dropdown.Item>
    </Dropdown.Menu>
</div>
))}`
export const datadropdown4 = `
   interface dropdown4 {
       id: number
       class: string
   }
 export const OutlineButtons = [
    { id: 1, class: 'outline-primary' },
    { id: 2, class: 'outline-secondary' },
    { id: 3, class: 'outline-success' },
    { id: 4, class: 'outline-info' },
    { id: 5, class: 'outline-warning' },
    { id: 6, class: 'outline-danger' }
  ];`
export const dropdown5 = `{OutlineButtons.map((idx)=>(
  <div className="btn-group" key={Math.random()}>
    <Button variant={idx.class} type="button" className="btn dropdown-toggle rounded-pill"
        data-bs-toggle="dropdown" aria-expanded="false">
        Action
    </Button>
    <Dropdown.Menu as="ul">
        <Dropdown.Item as="li" >Action</Dropdown.Item>
        <Dropdown.Item as="li" >Another action</Dropdown.Item>
        <Dropdown.Item as="li" >Something else here</Dropdown.Item>
        <li>
            <hr className="dropdown-divider"/>
        </li>
        <Dropdown.Item as="li" >Separated link</Dropdown.Item>
    </Dropdown.Menu>
  </div>
))}`
export const datadropdown5 = `
   interface dropdown5 {
       id: number
       class: string
   }
 export const OutlineButtons = [
    { id: 1, class: 'outline-primary' },
    { id: 2, class: 'outline-secondary' },
    { id: 3, class: 'outline-success' },
    { id: 4, class: 'outline-info' },
    { id: 5, class: 'outline-warning' },
    { id: 6, class: 'outline-danger' }
  ];`
export const dropdown6 = `{SplitButtons.map((idx)=>(
<div className="btn-group my-1" key={Math.random()}>
    <Button variant={idx.class} type="button" className="btn btn-primary">Action</Button>
    <Dropdown.Toggle variant={idx.class} type="button"
        className="btn btn-primary dropdown-toggle dropdown-toggle-split me-2"
        data-bs-toggle="dropdown" aria-expanded="false">
        <span className="visually-hidden">Toggle Dropdown</span>
    </Dropdown.Toggle>
    <Dropdown.Menu as="ul">
        <Dropdown.Item as="li" >Action</Dropdown.Item>
        <Dropdown.Item as="li" >Another action</Dropdown.Item>
        <Dropdown.Item as="li" >Something else here</Dropdown.Item>
        <li>
            <hr className="dropdown-divider"/>
        </li>
        <Dropdown.Item as="li" >Separated link</Dropdown.Item>
    </Dropdown.Menu>
</div>
))}`
export const datadropdown6 = `
   interface dropdown6 {
       id: number
       class: string
   }
  export const SplitButtonsdata= [
    { id: 1, class: 'primary' },
    { id: 2, class: 'secondary' },
    { id: 3, class: 'info' },
    { id: 4, class: 'success' },
    { id: 5, class: 'warning' },
    { id: 6, class: 'danger' }
  ];`
export const dropdown7 = `<div className="btn-group my-1 me-2">
    <Dropdown>
        <Dropdown.Toggle variant='' className="btn btn-primary btn-lg dropdown-toggle" type="button"
            data-bs-toggle="dropdown" aria-expanded="false">
            Large button
        </Dropdown.Toggle>
        <Dropdown.Menu as="ul">
            <Dropdown.Item as="li" >Action</Dropdown.Item>
            <Dropdown.Item as="li" >Another action</Dropdown.Item>
            <Dropdown.Item as="li" >Something else here</Dropdown.Item>
            <Dropdown.Divider className="dropdown-divider" />
            <Dropdown.Item as="li" >Separated link</Dropdown.Item>
        </Dropdown.Menu>
    </Dropdown>
</div>
<div className="btn-group my-1 me-2">
    <Dropdown as={ButtonGroup}>
        <Button variant="light">Large split button</Button>
        <Dropdown.Toggle split variant="light" id="dropdown-split-basic" />
        <Dropdown.Menu>
            <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
            <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
            <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
            <Dropdown.Divider className="dropdown-divider" />
            <Dropdown.Item as="li" >Separated link</Dropdown.Item>
        </Dropdown.Menu>
    </Dropdown>
</div>
<div className="btn-group my-1 me-2">
    <Dropdown>
        <Dropdown.Toggle size="sm" variant='' className="btn btn-primary dropdown-toggle" type="button"
            data-bs-toggle="dropdown" aria-expanded="false">
            Small button
        </Dropdown.Toggle>
        <Dropdown.Menu as="ul">
            <Dropdown.Item as="li" >Action</Dropdown.Item>
            <Dropdown.Item as="li" >Another action</Dropdown.Item>
            <Dropdown.Item as="li" >Something else here</Dropdown.Item>
            <Dropdown.Divider className="dropdown-divider" />
            <Dropdown.Item as="li" >Separated link</Dropdown.Item>
        </Dropdown.Menu>
    </Dropdown>
</div>
<div className="btn-group my-1 me-2">
    <Dropdown as={ButtonGroup}>
        <Button size='sm' variant="light">Small split button</Button>
        <Dropdown.Toggle split variant="light" id="dropdown-split-basic" />
        <Dropdown.Menu>
            <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
            <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
            <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
            <Dropdown.Divider className="dropdown-divider" />
            <Dropdown.Item as="li" >Separated link</Dropdown.Item>
        </Dropdown.Menu>
    </Dropdown>
</div>`
export const dropdown8 = `<Dropdown drop="up" 
className="btn-group dropup my-1 me-2">
    <Dropdown.Toggle variant='' 
    type="button" 
      className="btn btn-primary 
      dropdown-toggle"
      data-bs-toggle="dropdown" 
      aria-expanded="false">
        Dropup
    </Dropdown.Toggle>
    <Dropdown.Menu as="ul">
        <Dropdown.Item as="li" >Action</Dropdown.Item>
        <Dropdown.Item as="li" >Another action</Dropdown.Item>
        <Dropdown.Item as="li" >Something else here</Dropdown.Item>
        <Dropdown.Divider className="dropdown-divider" />
        <Dropdown.Item as="li" >Separated link</Dropdown.Item>
    </Dropdown.Menu>
</Dropdown>
<Dropdown drop="up" className="btn-group dropup my-1">
    <Button variant='' type="button" className="btn btn-info">
        Split dropup
    </Button>
    <Dropdown.Toggle variant='' type="button"
        className="btn btn-info dropdown-toggle dropdown-toggle-split"
        data-bs-toggle="dropdown" aria-expanded="false">
        <span className="visually-hidden">Toggle Dropdown</span>
    </Dropdown.Toggle>
    <Dropdown.Menu as="ul">
        <Dropdown.Item as="li" >Action</Dropdown.Item>
        <Dropdown.Item as="li" >Another action</Dropdown.Item>
        <Dropdown.Item as="li" >Something else here</Dropdown.Item>
        <Dropdown.Divider className="dropdown-divider" />
        <Dropdown.Item as="li" >Separated link</Dropdown.Item>
    </Dropdown.Menu>
</Dropdown>`
export const dropdown9 = `<Dropdown className="btn-group dropend my-1 me-2" drop="end">
    <Dropdown.Toggle variant='' type="button" className="btn btn-primary dropdown-toggle"
        data-bs-toggle="dropdown" aria-expanded="false">
        Dropright
    </Dropdown.Toggle>
    <Dropdown.Menu as="ul">
        <Dropdown.Item as="li" >Action</Dropdown.Item>
        <Dropdown.Item as="li" >Another action</Dropdown.Item>
        <Dropdown.Item as="li" >Something else here</Dropdown.Item>
        <Dropdown.Divider className="dropdown-divider" />
        <Dropdown.Item as="li" >Separated link</Dropdown.Item>
    </Dropdown.Menu>
</Dropdown>
<Dropdown drop="end" className="btn-group dropend my-1">
    <Button variant='' type="button" className="btn btn-info">
        Split dropend
    </Button>
    <Dropdown.Toggle variant='' type="button"
        className="btn btn-info dropdown-toggle dropdown-toggle-split"
        data-bs-toggle="dropdown" aria-expanded="false">
        <span className="visually-hidden">Toggle Dropright</span>
    </Dropdown.Toggle>
    <Dropdown.Menu as="ul">
        <Dropdown.Item as="li" >Action</Dropdown.Item>
        <Dropdown.Item as="li" >Another action</Dropdown.Item>
        <Dropdown.Item as="li" >Something else here</Dropdown.Item>
        <Dropdown.Divider className="dropdown-divider" />
        <Dropdown.Item as="li" >Separated link</Dropdown.Item>
    </Dropdown.Menu>
</Dropdown>`
export const dropdown10 = `<Dropdown className="btn-group dropstart my-1 me-2" drop="start">
<Dropdown.Toggle variant='' type="button" className="btn btn-primary dropdown-toggle"
    data-bs-toggle="dropdown" aria-expanded="false">
    Dropstart
</Dropdown.Toggle>
<Dropdown.Menu as="ul">
    <Dropdown.Item as="li" >Action</Dropdown.Item>
    <Dropdown.Item as="li" >Another action</Dropdown.Item>
    <Dropdown.Item as="li" >Something else here</Dropdown.Item>
    <li>
        <hr className="dropdown-divider"/>
    </li>
    <Dropdown.Item as="li" >Separated link</Dropdown.Item>
</Dropdown.Menu>
 </Dropdown>
 <div className="btn-group">
<Dropdown className="btn-group dropstart my-1" role="group" drop="start">
    <Dropdown.Toggle variant='' type="button"
        className="btn btn-info dropdown-toggle dropdown-toggle-split"
        data-bs-toggle="dropdown" aria-expanded="false">
        <span className="visually-hidden">Toggle Dropstart</span>
    </Dropdown.Toggle>
    <Dropdown.Menu as="ul">
        <Dropdown.Item as="li" >Action</Dropdown.Item>
        <Dropdown.Item as="li" >Another action</Dropdown.Item>
        <Dropdown.Item as="li" >Something else here</Dropdown.Item>
        <li>
            <hr className="dropdown-divider"/>
        </li>
        <Dropdown.Item as="li" >Separated link</Dropdown.Item>
    </Dropdown.Menu>
</Dropdown>
<Button variant='' type="button" className="btn btn-info my-1">
    Split dropstart
</Button>
 </div>`
export const dropdown11 = `<Dropdown>
 <Dropdown.Toggle variant='' type="button" className="btn btn-primary dropdown-toggle"
     data-bs-toggle="dropdown" aria-expanded="false">
     Dropstart
 </Dropdown.Toggle>
 <Dropdown.Menu as="ul">
     <Dropdown.Item as="li" >Regular link</Dropdown.Item>
     <Dropdown.Item className="dropdown-item active"  aria-current="true">Active
             link
     </Dropdown.Item>
     <Dropdown.Item as="li" >Another link</Dropdown.Item>
 </Dropdown.Menu>
 </Dropdown>`
export const dropdown12 = `  <Dropdown>
 <Dropdown.Toggle variant='' type="button" className="btn btn-primary dropdown-toggle"
 data-bs-toggle="dropdown" aria-expanded="false">
 Dropstart
 </Dropdown.Toggle>
 <Dropdown.Menu as="ul">
     <Dropdown.Item as="li" >Regular link</Dropdown.Item>
     <Dropdown.Item className="dropdown-item disabled"  aria-current="true">Active
             link</Dropdown.Item>
     <Dropdown.Item as="li" >Another link</Dropdown.Item>
 </Dropdown.Menu>
 </Dropdown>`
export const dropdown13 = ` {AutocloseButtons.map((idx)=>(
 <div className="btn-group">
 <Dropdown>
     <Dropdown.Toggle variant={idx.class} className="btn btn-primary dropdown-toggle" type="button"
         id="defaultDropdown" data-bs-toggle="dropdown" data-bs-auto-close="true"
         aria-expanded="false">
         {idx.text}
     </Dropdown.Toggle>
     <Dropdown.Menu as="ul" aria-labelledby="defaultDropdown">
         <Dropdown.Item as="li" >Menu item</Dropdown.Item>
         <Dropdown.Item as="li" >Menu item</Dropdown.Item>
         <Dropdown.Item as="li" >Menu item</Dropdown.Item>
     </Dropdown.Menu>
     </Dropdown>
 </div>
 ))}`
export const datadropdown13 = `
   interface dropdown13 {
       id: number
       class: string
       text:string
   }
 export const AutocloseButtons = [
  { id: 1, class: 'primary', text: 'DEfault dropdown' },
  { id: 2, class: 'secondary', text: 'Clickable  outside' },
  { id: 3, class: 'info', text: 'Clickable  inside' },
  { id: 4, class: 'warning', text: 'Manual  close' },
];`
export const dropdown14 = ` <Dropdown>
<Dropdown.Toggle variant='' className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu2"
    data-bs-toggle="dropdown" aria-expanded="false">
    Dropdown
</Dropdown.Toggle>
<Dropdown.Menu className="dropdown-menu">
    <Form className="px-4 py-3">
        <div className="mb-3">
            <Form.Label htmlFor="exampleDropdownFormEmail1" className="form-label">Email
                address</Form.Label>
            <Form.Control type="email" className="form-control" id="exampleDropdownFormEmail1"
                placeholder="email@example.com"/>
        </div>
        <div className="mb-3">
            <Form.Label htmlFor="exampleDropdownFormPassword1"
                className="form-label">Password</Form.Label>
            <Form.Control type="password" className="form-control"
                id="exampleDropdownFormPassword1" placeholder="Password"/>
        </div>
        <div className="mb-3">
            <div className="form-check">
                <input type="checkbox" className="form-check-input" id="dropdownCheck"/>
                <label className="form-check-label" htmlFor="dropdownCheck">
                    Remember me
                </label>
            </div>
        </div>
        <Button variant='' type="submit" className="btn btn-primary">Sign in</Button>
    </Form>
    <div className="dropdown-divider"></div>
    <Dropdown.Item as="li" >New around here? Sign up</Dropdown.Item>
    <Dropdown.Item as="li" >Forgot password?</Dropdown.Item>
</Dropdown.Menu>
</Dropdown>`
export const dropdown15 = `<Dropdown className="dropdown-center">
<Dropdown.Toggle variant='' className="btn btn-primary dropdown-toggle" type="button"
    id="dropdownCenterBtn" data-bs-toggle="dropdown" aria-expanded="false">
    Centered dropdown
</Dropdown.Toggle>
<Dropdown.Menu as="ul" aria-labelledby="dropdownCenterBtn">
    <Dropdown.Item as="li" >Action</Dropdown.Item>
    <Dropdown.Item as="li" >Action two</Dropdown.Item>
    <Dropdown.Item as="li" >Action three</Dropdown.Item>
</Dropdown.Menu>
</Dropdown>`
export const dropdown16 = `<Dropdown className="dropup-center dropup" drop="up">
<Dropdown.Toggle variant='' className="btn btn-secondary dropdown-toggle" type="button"
    id="dropupCenterBtn" data-bs-toggle="dropdown" aria-expanded="false">
    Centered dropup
</Dropdown.Toggle>
<Dropdown.Menu as="ul" aria-labelledby="dropupCenterBtn">
    <Dropdown.Item as="li" >Action</Dropdown.Item>
    <Dropdown.Item as="li" >Action two</Dropdown.Item>
    <Dropdown.Item as="li" >Action three</Dropdown.Item>
</Dropdown.Menu>
</Dropdown>`
export const dropdown17 = `<Dropdown className="dropdown">
<Dropdown.Toggle variant='' className="btn btn-info dropdown-toggle" type="button"
    id="dropdownMenu1" data-bs-toggle="dropdown" aria-expanded="false">
    Dropdown
</Dropdown.Toggle>
<Dropdown.Menu as="ul" aria-labelledby="dropdownMenu1">
    <Dropdown.Item><Button variant='' as="li" type="button">Action</Button></Dropdown.Item>
    <Dropdown.Item><Button variant='' as="li" type="button">Another action</Button>
    </Dropdown.Item>
    <Dropdown.Item><Button variant='' as="li" type="button">Something else
            here</Button>
    </Dropdown.Item>
</Dropdown.Menu>
   </Dropdown>`
export const dropdown18 = `<Dropdown className="dropdown me-1">
<Dropdown.Toggle variant='' type="button" className="btn btn-primary dropdown-toggle"
    id="dropdownMenuOffset" data-bs-toggle="dropdown" aria-expanded="false"
    data-bs-offset="10,20">
    Offset
</Dropdown.Toggle>
<Dropdown.Menu as="ul" aria-labelledby="dropdownMenuOffset">
    <Dropdown.Item as="li" >Action</Dropdown.Item>
    <Dropdown.Item as="li" >Another action</Dropdown.Item>
    <Dropdown.Item as="li" >Something else here</Dropdown.Item>
</Dropdown.Menu>
</Dropdown>
<div className="btn-group">
<Button variant='' type="button" className="btn btn-info">Reference</Button>
<Button variant='' type="button"
    className="btn btn-info dropdown-toggle dropdown-toggle-split"
    id="dropdownMenuReference" data-bs-toggle="dropdown"
    aria-expanded="false" data-bs-reference="parent">
    <span className="visually-hidden">Toggle Dropdown</span>
</Button>
<Dropdown.Menu as="ul" aria-labelledby="dropdownMenuReference">
    <Dropdown.Item as="li" >Action</Dropdown.Item>
    <Dropdown.Item as="li" >Another action</Dropdown.Item>
    <Dropdown.Item as="li" >Something else here</Dropdown.Item>
    <li>
        <hr className="dropdown-divider"/>
    </li>
    <Dropdown.Item as="li" >Separated link</Dropdown.Item>
</Dropdown.Menu>
</div>`
export const dropdown19 = `{AlignmentButtons.map((idx)=>(
<div className="btn-group" key={Math.random()}>
    <Dropdown drop={idx.dir}>
    <Dropdown.Toggle variant={idx.class} className="btn btn-primary dropdown-toggle mb-0" type="button"
        id="dropdownMenuButton" data-bs-toggle="dropdown"
        aria-expanded="false">
        {idx.text}
    </Dropdown.Toggle>
    <Dropdown.Menu as="ul" aria-labelledby="dropdownMenuButton">
        <Dropdown.Item as="li" >Menu item</Dropdown.Item>
        <Dropdown.Item as="li" >Menu item</Dropdown.Item>
        <Dropdown.Item as="li" >Menu item</Dropdown.Item>
    </Dropdown.Menu>
    </Dropdown>
</div>
))}`
export const datadropdown19 = `
interface dropdown19 {
    id: number
    class: string
    text:string
}
export const AutocloseButtons = [
{ id: 1, class: 'primary', text: 'DEfault dropdown' },
{ id: 2, class: 'secondary', text: 'Clickable  outside' },
{ id: 3, class: 'info', text: 'Clickable  inside' },
{ id: 4, class: 'warning', text: 'Manual  close' },
];`
export const dropdown20 = ` <Dropdown>
    <Dropdown.Toggle variant='' className="btn btn-dark dropdown-toggle" type="button"
        id="dropdownMenuButton3" data-bs-toggle="dropdown" aria-expanded="false">
        Dropdown button
    </Dropdown.Toggle>
    <Dropdown.Menu className="dropdown-menu dropdown-menu-dark">
        <Dropdown.Item as="li" >Action</Dropdown.Item>
        <Dropdown.Item as="li" >Another action</Dropdown.Item>
        <Dropdown.Item as="li" >Something else here</Dropdown.Item>
    </Dropdown.Menu>
</Dropdown>`
export const dropdown21 = `<div className="btn-group">
    <Dropdown>
        <Dropdown.Toggle variant='' type="button" className="btn btn-primary dropdown-toggle"
            data-bs-toggle="dropdown" aria-expanded="false">
            Right-aligned menu example
        </Dropdown.Toggle>
        <Dropdown.Menu className="dropdown-menu dropdown-menu-end">
            <Dropdown.Item>Action
            </Dropdown.Item>
            <Dropdown.Item>Another
                action</Dropdown.Item>
            <Dropdown.Item>Something else
                here
            </Dropdown.Item>
        </Dropdown.Menu>
    </Dropdown>
</div>`
export const dropdown22 = `<div className="btn-group">
    <DropdownButton as={ButtonGroup} align={{ lg: 'end' }} title="Left-aligned but right aligned when large screen" id="dropdown-menu-align-responsive-1" className="text-wrap">
        <Dropdown.Item eventKey="1">Action 1</Dropdown.Item>
        <Dropdown.Item eventKey="2">Action 2</Dropdown.Item>
    </DropdownButton>
</div>`
export const dropdown23 = `<div className="btn-group">
    <DropdownButton as={ButtonGroup} align={{ lg: 'start' }} title="Left-aligned but right aligned when large screen" className="text-wrap" id="dropdown-menu-align-responsive-1">
        <Dropdown.Item eventKey="1">Action 1</Dropdown.Item>
        <Dropdown.Item eventKey="2">Action 2</Dropdown.Item>
    </DropdownButton>
</div>`
export const dropdown24 = `<div className="btn-list">
    {CustomButtons.map((idx) => (
        <div className="btn-group" key={Math.random()}>
            <Dropdown>
                <Dropdown.Toggle variant={idx.class} className="btn dropdown-toggle" 
                  type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    {idx.text}
                </Dropdown.Toggle>
                <Dropdown.Menu className={'dropdown-menu 
                   dropdown-$#38{idx.class1} dropmenu-$#38{idx.class2}'}>
                    <Dropdown.Item className="dropdown-item" >Action</Dropdown.Item>
                    <Dropdown.Item className="dropdown-item" >Another action</Dropdown.Item>
                    <Dropdown.Item className="dropdown-item" >Something else here</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </div>
    ))}
</div>`
export const datadropdown24 = `
interface dropdown24 {
    id: number
    class: string
    class1:string
    class2:string
    text:string
}
export const CustomButtons = [
  { id: 1, class: 'primary', text: 'Primary', class1: 'menu-primary', class2: '' },
  { id: 2, class: 'secondary', text: 'Secondary', class1: 'menu-secondary', class2: '' },
  { id: 3, class: 'warning', text: 'warning', class2: 'item-warning', class1: '' },
  { id: 4, class: 'info', text: 'info', class2: 'item-info', class1: '' },
  { id: 5, class: 'success', text: 'success', class2: 'light-success', class1: '' },
  { id: 6, class: 'danger', text: 'danger', class2: 'light-danger', class1: '' }
];`
export const dropdown25 = `<div className="btn-list">
    {GhostButtons.map((idx) => (
        <div className="btn-group" key={Math.random()}>
            <Dropdown>
                <Dropdown.Toggle variant={idx.class} type="button" className="btn 
                  btn-primary-ghost dropdown-toggle"
                    data-bs-toggle="dropdown" aria-expanded="false">
                    {idx.text}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item className="dropdown-item" >Action</Dropdown.Item>
                    <Dropdown.Item className="dropdown-item" >Another action</Dropdown.Item>
                    <Dropdown.Item className="dropdown-item" >Something else here</Dropdown.Item>
                    <Dropdown.Divider className="dropdown-divider" />
                    <Dropdown.Item className="dropdown-item" >Separated link</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </div>
    ))}
</div>`
export const datadropdown25 = `
interface dropdown24 {
    id: number
    class: string
    text:string
}
export const GhostButtons = [
  { id: 1, class: 'primary-ghost', text: 'Primary' },
  { id: 2, class: 'secondary-ghost', text: 'Secondary' },
  { id: 3, class: 'warning-ghost', text: 'warning' },
  { id: 4, class: 'info-ghost', text: 'info' },
  { id: 5, class: 'success-ghost', text: 'success' },
  { id: 6, class: 'danger-ghost', text: 'danger' }
];`
export const dropdown26 = `<p className="card-title mb-3">Use <code>.dropdown-item-text.</code> to create non-interactive dropdown items.</p>
<div className="bd-example">
    <Dropdown.Menu className="dropdown-menu" show>
        <Dropdown.Item><span className="dropdown-item-text">Dropdown item text</span>
        </Dropdown.Item>
        <Dropdown.Item >Action</Dropdown.Item>
        <Dropdown.Item >Another action</Dropdown.Item>
        <Dropdown.Item >Something else here
        </Dropdown.Item>
    </Dropdown.Menu>
</div>`
export const dropdown27 = `<p className="card-titlte mb-3">Add a <code>.dropdown-header</code> to label sections of actions in any dropdown menu.</p>
<div className="bd-example">
    <Dropdown.Menu show>
        <Dropdown.Header>
            <h6 className="dropdown-header">Dropdown header</h6>
        </Dropdown.Header>
        <Dropdown.Item className="dropdown-item" >Action</Dropdown.Item>
        <Dropdown.Item className="dropdown-item" >Another action</Dropdown.Item>
        <Dropdown.Item className="dropdown-item" >Something else here</Dropdown.Item>
    </Dropdown.Menu>
</div>`
export const dropdown28 = `<div className="bd-example">
    <Dropdown.Menu className="dropdown-menu" show>
        <Dropdown.Header>Heading</Dropdown.Header>
        <Dropdown.Item className="dropdown-item" >Action</Dropdown.Item>
        <Dropdown.Item className="dropdown-item" >Another action</Dropdown.Item>
        <Dropdown.Item className="dropdown-item" >Something else here</Dropdown.Item>
        <Dropdown.Divider className="dropdown-divider" />
        <Dropdown.Item className="dropdown-item" >Separated link</Dropdown.Item>
    </Dropdown.Menu>
</div>`
export const dropdown29 = ` <div className="bd-example">
    <Dropdown.Menu show className="dropdown-menu p-4 text-muted" style={{ maxWidth: 200 }}>
        <p>
            Some example text that's free-flowing within the dropdown menu.
        </p>
        <p className="mb-0">
            And this is more example text.
        </p>
    </Dropdown.Menu>
</div>`

export const Image11 = ` <p className="card-title mb-3">Use
    <code> .img-fluid </code>
    class to the img tag to get responsive image.
</p>
<div className="text-center">
    <img src={meadia1} className="img-fluid" alt="..." />
</div>`
export const Image2 = `<div className="text-center">
  <img src={media2} className="img-fluid rounded" alt="..."/>
</div>`
export const Image3 = `<div className="text-center">
 <img src={media3} className="img-fluid 
    rounded-pill" alt="..." />
</div>`
export const Image4 = `<img className="rounded float-start" src={media4} alt="..." />`
export const Image5 = ` <img className="rounded mx-auto d-block" src={media5} alt="..."/>`
export const Image6 = `<img className="rounded float-end" src={media6} alt="..."/>`
export const Image7 = `<figure className="figure">
<img className="bd-placeholder-img figure-img img-fluid rounded card-img" src={media7} alt="..." />
<figcaption className="figure-caption mt-2">A caption for the above image.
</figcaption>
</figure>
<figure className="figure float-end">
<img className="bd-placeholder-img figure-img img-fluid rounded card-img" src={media8} alt="..." />
<figcaption className="figure-caption text-end mt-2">A caption for the above image.
</figcaption>
</figure>`
export const Image8 = `<div className="text-center">
    <img src={media9} 
      className="img-thumbnail" alt="..." />
</div>`
export const Image9 = `<div className="text-center">
<img src={media10} className="img-thumbnail 
   rounded-pill" alt="..."/>
</div>`

export const ListGroup1 = `<ListGroup as="ul">
    {BasicButtons.map((idx) => (
        <ListGroup.Item as="li" key={Math.random()}>
            <div className="d-flex align-items-center">
                <span className="avatar avatar-sm">
                    <img src={idx.src} alt="img" />
                </span>
                <div className="ms-2 fw-semibold">
                    {idx.text}
                </div>
            </div>
        </ListGroup.Item>
    ))}
</ListGroup>`
export const dataListGroup1 = `
interface ListGroup1 {
    id: number
    src: string
    text:string
}
export const BasicButtons = [
  { id: 1, src: "../../../assets/images/faces/1.jpg", 
   text: 'Alicia Sierra' },
  { id: 2, src: "../../../assets/images/faces/3.jpg", 
   text: 'Samantha Mery' },
  { id: 3, src: "../../../assets/images/faces/6.jpg", 
   text: 'Juliana Pena' },
  { id: 4, src: "../../../assets/images/faces/15.jpg", 
   text: 'Adam Smith' },
  { id: 5, src: "../../../assets/images/faces/13.jpg", 
   text: 'Farhaan Amhed' },
];`
export const ListGroup2 = ` <ListGroup as="ul">
    {ActiveButtons.map((idx) => (
        <ListGroup.Item as="li" 
          className={'list-group-item $#38{idx.class1}'} 
           aria-current="true" key={Math.random()}>
            <div className="d-flex align-items-center">
                <div>
                    <span className="fs-15">
                    <i className={'bi bi-$#38{idx.class}'}>
                    </i>
                    </span>
                </div>
                <div className="ms-2">
                    {idx.text}
                </div>
            </div>
        </ListGroup.Item>
    ))}
</ListGroup>`
export const dataListGroup2 = `
interface ListGroup2 {
    id: number
    class:string
    class1: string
    text:string
}
export const ActiveButtons = [
  { id: 1, class: 'house-door', text: 'Home', class1: 'active' },
  { id: 2, class: 'bell', text: 'Notifications', class1: '' },
  { id: 3, class: 'gift', text: 'Sent Messages', class1: '' },
  { id: 4, class: 'person', text: 'New Requests', class1: '' },
  { id: 5, class: 'trash3', text: 'Deleted Messages', class1: 
   '' },
];`
export const ListGroup3 = ` <ListGroup as="ul">
    <ListGroup.Item as="li" 
       className="list-group-item disabled" 
       aria-disabled="true">
       A disabled item meant to be disabled
    </ListGroup.Item>
    <ListGroup.Item as="li">
       Simply dummy text of the printing
    </ListGroup.Item>
    <ListGroup.Item as="li">
       There are many variations of passages
    </ListGroup.Item>
    <ListGroup.Item as="li">
        All the Lorem Ipsum generators
    </ListGroup.Item>
    <ListGroup.Item as="li">
       Written in 45 BC. This book is a treatise on the theory
    </ListGroup.Item>
</ListGroup>`
export const ListGroup4 = ` <ListGroup variant='flush' className="">
    <ListGroup.Item className="list-group-item fw-semibold">
      <i className="bi bi-envelope align-middle 
      me-2 text-muted"></i>
      Asish Trivedhi
      <span className="ms-1 text-muted fw-normal 
        d-inline-block">
       (+1023-84534)
      </span>
    </ListGroup.Item>
    <ListGroup.Item className="list-group-item fw-semibold">
       <i className="bi bi-tiktok align-middle 
        me-2 text-muted"></i>
        Alezander Russo
       <span className="ms-1 text-muted fw-normal 
        d-inline-block">
       (+7546-12342)
      </span>
    </ListGroup.Item>
    <ListGroup.Item className="list-group-item fw-semibold">
       <i className="bi bi-whatsapp align-middle me-2 
         text-muted"></i>
          Karem Smith
        <span className="ms-1 text-muted fw-normal 
         d-inline-block">
          (+9944-56632)
        </span>
    </ListGroup.Item>
    <ListGroup.Item className="list-group-item fw-semibold">
       <i className="bi bi-facebook align-middle me-2 
         text-muted"></i>
          Melissa Brien
       <span className="ms-1 text-muted fw-normal 
        d-inline-block">
         (+1023-34323)
        </span>
    </ListGroup.Item>
    <ListGroup.Item className="list-group-item fw-semibold">
       <i className="bi bi-instagram align-middle 
         me-2 text-muted"></i>
         Kamala Harris
       <span className="ms-1 text-muted fw-normal 
         d-inline-block">
        (+91-63421)
       </span>
    </ListGroup.Item>
</ListGroup>`
export const ListGroup5 = `<ListGroup className="list-group">
    {LinksButtons.map((idx) => (
        <ListGroup.Item action className={'list-group-item 
          list-group-item-action $#38{idx.class1}'} 
            key={Math.random()}
            aria-current="true">
            <div className="d-flex align-items-center">
                <div>
                    <span className={'avatar avatar-xs 
                     bg-$#38{idx.class} text-$#38{idx.color} 
                      avatar-rounded'}>
                        {idx.text1}
                    </span>
                </div>
                <div className="ms-2">{idx.text}</div>
            </div>
        </ListGroup.Item>
    ))}
</ListGroup>`
export const dataListGroup5 = `
interface ListGroup5 {
    id: number
    class:string
    class1: string
    text:string
    text1:string
}
export const LinksButtons = [
  { id: 1, class: 'white', text: 'California', 
    class1: 'active', text1: 'C', color: 'default' },
  { id: 2, class: 'secondary', text: 'New Jersey', 
   class1: '', text1: 'N', color: '' },
  { id: 3, class: 'info', text: 'Los Angeles', 
    class1: '', text1: 'L', color: '' },
  { id: 4, class: 'warning', text: 'Miami Florida', 
    class1: '', text1: 'M', color: '' },
  { id: 5, class: 'success', text: 'Washington D.C', 
    class1: 'disabled', text1: 'W', color: '' },
];`
export const ListGroup6 = ` <ListGroup className="list-group">
    <ListGroup.Item type="button" 
      className="list-group-item list-group-item-action 
       active" aria-current="true">
       Simply dummy text of the printing
       <span className="badge float-end bg-primary">
        243
       </span>
    </ListGroup.Item>
    <ListGroup.Item type="button" 
      className="list-group-item list-group-item-action">
      There are many variations of passages
      <span className="badge float-end 
         bg-secondary-transparent">
        35
      </span>
    </ListGroup.Item>
    <ListGroup.Item type="button" className="list-group-item 
     list-group-item-action">
       All the Lorem Ipsum generators
       <span className="badge float-end bg-info-transparent">
         132
        </span>
    </ListGroup.Item>
    <ListGroup.Item type="button" className="list-group-item 
     list-group-item-action">
      All the Lorem Ipsum generators
      <span className="badge float-end 
       bg-success-transparent">
        2525
      </span>
    </ListGroup.Item>
    <ListGroup.Item type="button" className="list-group-item 
     list-group-item-action" disabled>
       A disabled item meant to be disabled
        <span className="badge float-end 
         bg-danger-transparent">
          21
        </span>
    </ListGroup.Item>
</ListGroup>`
export const ListGroup7 = `<ListGroup as="ul">
    {ContextualButtons.map((idx) => (
        <ListGroup.Item as="li" variant={idx.class} key={Math.random()}>{idx.text}</ListGroup.Item>
    ))}
</ListGroup>`
export const dataListGroup7 = `
interface ListGroup7 {
    id: number
    class:string
    class1: string
    text:string
}
export const ContextualButtons = [
  { id: 1, text: 'A simple default list group item', class: 'light', class1: '' },
  { id: 2, text: 'A simple primary list group item', class: 'primary', class1: '' },
  { id: 3, text: 'A simple secondary list group item', class: 'secondary', class1: '' },
  { id: 4, text: 'A simple success list group item', class: 'success', class1: '' },
  { id: 5, text: 'A simple danger list group item', class: 'danger', class1: '' },
  { id: 6, text: 'A simple warning list group item', class: 'warning', class1: '' },
  { id: 7, text: 'A simple info list group item', class: 'info', class1: '' },
  { id: 8, text: 'A simple light list group item', class: 'light', class1: '' },
  { id: 9, text: 'A simple dark list group item', class: 'dark', class1: 'text-white' }
];`
export const ListGroup8 = `{ContextualButtons.map((idx) => (
    <ListGroup.Item variant={idx.class} action className="list-group-item list-group-item-action" 
     key={Math.random()}>{idx.text}</ListGroup.Item>
))}`
export const dataListGroup8 = `
interface ListGroup8 {
    id: number
    class:string
    class1: string
    text:string
}
export const ContextualButtons = [
  { id: 1, text: 'A simple default list group item', class: 'light', class1: '' },
  { id: 2, text: 'A simple primary list group item', class: 'primary', class1: '' },
  { id: 3, text: 'A simple secondary list group item', class: 'secondary', class1: '' },
  { id: 4, text: 'A simple success list group item', class: 'success', class1: '' },
  { id: 5, text: 'A simple danger list group item', class: 'danger', class1: '' },
  { id: 6, text: 'A simple warning list group item', class: 'warning', class1: '' },
  { id: 7, text: 'A simple info list group item', class: 'info', class1: '' },
  { id: 8, text: 'A simple light list group item', class: 'light', class1: '' },
  { id: 9, text: 'A simple dark list group item', class: 'dark', class1: 'text-white' }
];`
export const ListGroup9 = ` {ContextualButtons.map((idx) => (
    <ListGroup.Item className={'list-group-item list-item-solid-$#38{idx.class} $#38{idx.class1}'} 
     as="li" key={Math.random()}>{idx.text}</ListGroup.Item>
))}`
export const dataListGroup9 = `
interface ListGroup9 {
    id: number
    class:string
    class1: string
    text:string
}
export const ContextualButtons = [
  { id: 1, text: 'A simple default list group item', class: 'light', class1: '' },
  { id: 2, text: 'A simple primary list group item', class: 'primary', class1: '' },
  { id: 3, text: 'A simple secondary list group item', class: 'secondary', class1: '' },
  { id: 4, text: 'A simple success list group item', class: 'success', class1: '' },
  { id: 5, text: 'A simple danger list group item', class: 'danger', class1: '' },
  { id: 6, text: 'A simple warning list group item', class: 'warning', class1: '' },
  { id: 7, text: 'A simple info list group item', class: 'info', class1: '' },
  { id: 8, text: 'A simple light list group item', class: 'light', class1: '' },
  { id: 9, text: 'A simple dark list group item', class: 'dark', class1: 'text-white' }
];
`
export const ListGroup10 = `<ListGroup className="list-group">
    {CustomButtons.map((idx) => (
        <ListGroup.Item action className={'list-group-item-action $#38{idx.class1}'} 
          key={Math.random()}
            aria-current="true">
            <div className="d-flex w-100 justify-content-between gap-1">
                <h6 className="mb-1 fw-semibold">{idx.heading}</h6>
                <small className={idx.class2}>{idx.text1}</small>
            </div>
            <p className="mb-1">{idx.text2}</p>
            <small>{idx.text3}.</small>
        </ListGroup.Item>
    ))}
</ListGroup>`
export const dataListGroup10 = `
interface ListGroup10 {
    id: number
    heading:string
    class1: string
    text1:string
    text2:string
    text3:string
    class2:string
}
export const CustomButtons = [
{ id: 1, heading: 'Web page editors now use Lorem Ipsum?', text1: '3 days ago', class1: 'active', 
 text2: 'There are many variations of passages of Lorem Ipsum available, but the majority 
  have suffered alteration in some form, by injected humour.', text3: "24,Nov 2022", 
 class2: '' 
},
{ id: 2, heading: 'Richard McClintock, a Latin professor?', text1: '4 hrs ago', 
 class1: '', text2: 'Contrary to popular belief, Lorem Ipsum is not simply random text. 
  It has roots in a piece of classical Latin literature.', 
 text3: "30,Nov 2022.", class2: 'text-muted'
},
{ id: 3, heading: 'It uses a dictionary of over 200 Latin words?', text1: '15 hrs ago',
 class1: '',text2: 'Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.',
   text3: "4,Nov 2022.", class2: 'text-muted' 
},
{ id: 4, heading: 'The standard Lorem Ipsum used since the 1500s?', text1: '45 mins ago', 
 class1: '',text2: 'All the Lorem Ipsum generators on the Internet tend to repeat predefined 
  chunks as necessary, making this the first true generator on the Internet.', 
  text3: "28,Oct 2022.", class2: 'text-muted'
},
];
`
export const ListGroup11 = `<ListGroup as="ol" numbered>
    {SubheadingsButtons.map((idx) => (
        <ListGroup.Item as="li" 
          className="list-group-item d-flex 
           justify-content-between
            align-items-start" key={Math.random()}>
            <div className="ms-2 me-auto text-muted">
                <div className="fw-semibold fs-14 
                  text-default">{idx.text1}</div>
                {idx.text2}
            </div>
            <Badge bg={idx.class}>{idx.text3}</Badge>
        </ListGroup.Item>
    ))}
</ListGroup>`
export const dataListGroup11 = `
interface ListGroup11 {
    id: number
    class:string
    text1:string
    text2:string
    text3:string
}
export const SubheadingsButtons = [
  { id: 1, text1: "What Happened?", 
   text2: "Many experts have recently suggested may exist.", 
   text3: "32 Views", class: 'primary-transparent' 
  },
  { id: 2, text1: "It Was Amazing!", 
   text2: " His idea involved taking red.",
   text3: "52 Views", class: 'secondary-transparent' 
  },
  { id: 3, text1: "News Is A Great Weapon.", 
   text2: "News can influence in many ways.", 
   text3: "1,204 Views", class: 'success-transparent'
  },
  { id: 4, text1: "majority have suffered.", 
    text2: " If you are going to use a passage of Lorem Ipsum, 
     you need to be sure there isn't anything.", 
    text3: "14 Views", class: 'danger-transparent'
  }
];
`
export const ListGroup12 = `<ListGroup as="ol" numbered>
    <ListGroup.Item as="li">
       Simply dummy text of the printing.
    </ListGroup.Item>
    <ListGroup.Item as="li">
       There are many variations of passages.
    </ListGroup.Item>
    <ListGroup.Item as="li">
      All the Lorem Ipsum generators.
    </ListGroup.Item>
    <ListGroup.Item as="li">
      Written in 45 BC. This book is a treatise on the theory.
    </ListGroup.Item>
    <ListGroup.Item as="li">
       Randomised words which don't look.
    </ListGroup.Item>
    <ListGroup.Item as="li">
       Always free from repetition, injected humour.
    </ListGroup.Item>
</ListGroup>`
export const ListGroup13 = `<ListGroup as="ul">
    <ListGroup.Item as="li">
        <input className="form-check-input me-2 
         fw-semibold" type="checkbox" value=""
            aria-label="..." defaultChecked />
        Accurate information at any given point.
    </ListGroup.Item>
    <ListGroup.Item as="li">
        <input className="form-check-input me-2 
         fw-semibold" type="checkbox" value=""
            aria-label="..." />
        Hearing the information and responding.
    </ListGroup.Item>
    <ListGroup.Item as="li">
        <input className="form-check-input me-2 
         fw-semibold" type="checkbox" value=""
            aria-label="..." defaultChecked />
        Setting up and customizing your own sales.
    </ListGroup.Item>
    <ListGroup.Item as="li">
        <input className="form-check-input me-2 
         fw-semibold" type="checkbox" value=""
            aria-label="..." defaultChecked />
        New Admin Launched.
    </ListGroup.Item>
    <ListGroup.Item as="li">
        <input className="form-check-input me-2 
         fw-semibold" type="checkbox" value=""
            aria-label="..." />
        To maximize profits and improve productivity.
    </ListGroup.Item>
    <ListGroup.Item as="li">
        <input className="form-check-input me-2 
         fw-semibold" type="checkbox" value=""
            aria-label="..." />
        To have a complete 360° overview of sales information, 
         having.
    </ListGroup.Item>
</ListGroup>`
export const ListGroup14 = `  <ListGroup className="list-group">
    <ListGroup.Item className="list-group-item">
        <input className="form-check-input me-1" 
          type="radio" value=""
            name="list-radio" defaultChecked />
        Accurate information at any given point.
    </ListGroup.Item>
    <ListGroup.Item className="list-group-item">
        <input className="form-check-input me-1" 
          type="radio" value=""
            name="list-radio" defaultChecked />
        Hearing the information and responding.
    </ListGroup.Item>
    <ListGroup.Item className="list-group-item">
        <input className="form-check-input me-1" 
          type="radio" value=""
            name="list-radio" defaultChecked />
        Setting up and customizing your own sales.
    </ListGroup.Item>
    <ListGroup.Item className="list-group-item">
        <input className="form-check-input me-1"
           type="radio" value=""
            name="list-radio" />
        New Admin Launched.
    </ListGroup.Item>
    <ListGroup.Item className="list-group-item">
        <input className="form-check-input me-1" 
          type="radio" value=""
            name="list-radio" />
        To maximize profits and improve productivity.
    </ListGroup.Item>
    <ListGroup.Item className="list-group-item">
        <input className="form-check-input me-1"
           type="radio" value=""
            name="list-radio" />
        To have a complete 360° overview of sales information, 
         having.
    </ListGroup.Item>
</ListGroup>`
export const ListGroup15 = `{ListbadgesButtons.map((idx) => (
    <ListGroup.Item key={Math.random()}
        className="list-group-item d-flex 
        justify-content-between align-items-center 
         fw-semibold">
        {idx.text1}
        <Badge bg={idx.class} className={idx.color}>
           {idx.text2}
        </Badge>
    </ListGroup.Item>
))}`
export const dataListGroup15 = `
interface ListGroup15 {
    id: number
    color:string
    class: string
    text1:string
    text2:string
}
export const ListbadgesButtons = [
  { id: 1, text1: 'Groceries', text2: 'Available', 
   class: 'primary', color: '' },
  { id: 2, text1: 'Furniture', text2: 'Buy', 
   class: 'secondary', color: '' },
  { id: 3, text1: 'Beauty', text2: '32', 
   class: 'danger', color: '' },
  { id: 4, text1: 'Books', text2: 'New', 
   class: 'light', color: 'text-default' },
  { id: 5, text1: 'Toys', text2: 'Hot', 
   class: 'info-gradient', color: '' },
  { id: 6, text1: 'Mobiles', text2: 'Sold Out', 
   class: 'warning', color: '' },
];
`
export const ListGroup16 = `{HorizontalButtons.map((idx) => (
    <ListGroup as="ul" className={'list-group-horizontal 
      $#38{idx.class} mb-3'} key={Math.random()}>
        <ListGroup.Item as="li">An item</ListGroup.Item>
        <ListGroup.Item as="li">A second item</ListGroup.Item>
        <ListGroup.Item as="li">A third item</ListGroup.Item>
    </ListGroup>
))}`
export const dataListGroup16 = `
interface ListGroup16 {
    id: number
    class: string
}
export const HorizontalButtons = [
  { id: 1, class: '' },
  { id: 2, class: '-sm' },
  { id: 3, class: '-md' },
  { id: 4, class: '-lg' },
  { id: 5, class: '-xl' },
  { id: 6, class: '-xxl' },
];`

export const pagination1 = `<nav aria-label="Page navigation">
    <Pagination as="ul" 
      className="pagination mb-0">
        <Pagination.Item disabled 
          className="disabled" >
           Previous
        </Pagination.Item>
        <Pagination.Item >
          1
        </Pagination.Item>
        <Pagination.Item >
          2
        </Pagination.Item>
        <Pagination.Item >
           Next
        </Pagination.Item>
    </Pagination>
</nav>`
export const pagination2 = ` <nav aria-label="Page navigation">
    <Pagination 
       className="pagination mb-0">
        <Pagination.Item 
          className="page-item" 
          aria-label="Previous">
            <span aria-hidden="true">
             <i className="bi 
               bi-caret-left">
             </i>
            </span>
        </Pagination.Item>
        <Pagination.Item >
           1
        </Pagination.Item>
        <Pagination.Item >
          2
        </Pagination.Item>
        <Pagination.Item >
          3
        </Pagination.Item>
        <Pagination.Item 
         className="page-item" 
           aria-label="Next">
            <span aria-hidden="true">
              <i className="bi 
               bi-caret-right"></i>
            </span>
        </Pagination.Item>
    </Pagination>
</nav>`
export const pagination3 = `<nav aria-label="...">
    <Pagination as="ul" className="pagination pagination-sm mb-0">
        <Pagination.Item active aria-current="page">
            1
        </Pagination.Item>
        <Pagination.Item >2</Pagination.Item>
        <Pagination.Item >3</Pagination.Item>
    </Pagination>
</nav>
<nav aria-label="...">
    <Pagination as="ul" className="pagination mb-0">
        <Pagination.Item active aria-current="page">
            1
        </Pagination.Item>
        <Pagination.Item >2</Pagination.Item>
        <Pagination.Item >3</Pagination.Item>
    </Pagination>
</nav>
<nav aria-label="...">
    <Pagination className="pagination pagination-lg mb-0">
        <Pagination.Item className=" active" aria-current="page">
            1
        </Pagination.Item>
        <Pagination.Item >2</Pagination.Item>
        <Pagination.Item >3</Pagination.Item>
    </Pagination>
</nav>`
export const pagination4 = `  <nav aria-label="Page navigation">
    <Pagination className="justify-content-center">
        <Pagination.Item disabled>Previous
        </Pagination.Item>
        <Pagination.Item >1</Pagination.Item>
        <Pagination.Item >2</Pagination.Item>
        <Pagination.Item >3</Pagination.Item>
        <Pagination.Item >Next
        </Pagination.Item>
    </Pagination>
</nav>
<nav aria-label="Page navigation">
    <Pagination className="justify-content-end mb-0">
        <Pagination.Item disabled >Previous
        </Pagination.Item>
        <Pagination.Item >1</Pagination.Item>
        <Pagination.Item >2</Pagination.Item>
        <Pagination.Item >3</Pagination.Item>
        <Pagination.Item >Next
        </Pagination.Item>
    </Pagination>
</nav>`
export const pagination5 = `<nav aria-label="..." className="me-3">
    <Pagination className="pagination">
        <Pagination.Item disabled>Previous
        </Pagination.Item>
        <Pagination.Item >1</Pagination.Item>
        <Pagination.Item active aria-current="page" >2
        </Pagination.Item>
        <Pagination.Item >Next
        </Pagination.Item>
    </Pagination>
</nav>
<nav aria-label="...">
    <Pagination className="pagination">
        <Pagination.Item disabled>Previous
        </Pagination.Item>
        <Pagination.Item >1</Pagination.Item>
        <Pagination.Item active aria-current="page">2
        </Pagination.Item>
        <Pagination.Item >Next
        </Pagination.Item>
    </Pagination>
</nav>`
export const pagination6 = `<nav aria-label="Page navigation" className="pagination-style-1">
    <Pagination className="pagination mb-0">
        <Pagination.Item disabled >
            <i className="ri-arrow-left-s-line align-middle"></i>
        </Pagination.Item>
        <Pagination.Item >1</Pagination.Item>
        <Pagination.Item active >2</Pagination.Item>
        <Pagination.Item ><i className="bi bi-three-dots"></i>
        </Pagination.Item>
        <Pagination.Item >21</Pagination.Item>
        <Pagination.Item >
            <i className="ri-arrow-right-s-line align-middle"></i>
        </Pagination.Item>
    </Pagination>
</nav>`
export const pagination7 = ` <nav aria-label="Page navigation" className="pagination-style-2">
    <Pagination className="mb-0 flex-wrap">
        <Pagination.Item disabled >Prev
        </Pagination.Item>
        <Pagination.Item active >1</Pagination.Item>
        <Pagination.Item >2</Pagination.Item>
        <Pagination.Item     >
            <i className="bi bi-three-dots"></i>
        </Pagination.Item>
        <Pagination.Item >17</Pagination.Item>
        <Pagination.Item className='pagination-next' >
            next
        </Pagination.Item>
    </Pagination>
</nav>`
export const pagination8 = ` <nav aria-label="Page navigation" className="pagination-style-3">
    <Pagination className=" mb-0 flex-wrap">
        <Pagination.Item disabled>Prev
        </Pagination.Item>
        <Pagination.Item active >1</Pagination.Item>
        <Pagination.Item >2</Pagination.Item>
        <Pagination.Item >
            <i className="bi bi-three-dots"></i>
        </Pagination.Item>
        <Pagination.Item >16</Pagination.Item>
        <Pagination.Item className="pagination-next" >next </Pagination.Item>
    </Pagination>
</nav>`
export const pagination9 = `<nav aria-label="Page navigation" className="pagination-style-4">
    <Pagination className="mb-0 flex-wrap">
        <Pagination.Item disabled >
            Prev
        </Pagination.Item>
        <Pagination.Item active >1</Pagination.Item>
        <Pagination.Item >2</Pagination.Item>
        <Pagination.Item >
            <i className="bi bi-three-dots"></i>
        </Pagination.Item>
        <Pagination.Item >16</Pagination.Item>
        <Pagination.Item >17</Pagination.Item>
        <Pagination.Item className="pagination-next" >
            next
        </Pagination.Item>
    </Pagination>
</nav>`


export const popover1 = `<div className="btn-list">
    {Defaultalerts.map((idx) => (
        <OverlayTrigger trigger="click" placement={idx.class} key={Math.random()}
            overlay={<Popover>
                <Popover.Header as="h3"> Popover {idx.text}</Popover.Header>
                <Popover.Body>
                    And here's some amazing content. It's very engaging. Right?
                </Popover.Body>
            </Popover>}>
            <Button variant='' className="btn btn-outline-primary btn-wave">
              Popover {idx.text}
            </Button>
        </OverlayTrigger>
    ))}
</div>`
export const datapopover1 = `
interface popover1 {
    id: number
    text: string
    class: string
}
export const Defaultalerts = [
  { id: 1, text: 'Top', class: 'top' },
  { id: 2, text: 'Right', class: 'right' },
  { id: 3, text: 'Bottom', class: 'bottom' },
  { id: 4, text: 'Left', class: 'left' },
];`
export const popover2 = ` <div className="btn-list">
    {Colorheaderalerts.map((idx) => (
        <OverlayTrigger trigger="click" placement={idx.class} key={Math.random()}
            // autoclose='true' 
            overlay={<Popover className={'header-$#38{idx.color1} $#38{idx.color2}'}>
                <Popover.Header as="h3" data-bs-custom-classname={'header-$#38{idx.color1}'}>
                   Color Header
                </Popover.Header>
                <Popover.Body>
                    Popover with primary header.
                </Popover.Body>
            </Popover>}>
            <Button variant={idx.color} className="btn btn-wave">Header {idx.text}</Button>
        </OverlayTrigger>
    ))}
</div>`
export const datapopover2 = `
interface popover2 {
    id: number
    text: string
    class: string
    color: string
    color1: string
    color2: string
}
  export const Colorheaderalerts= [
    { id: 1, text: 'Primary', class: 'top', color: 'outline-primary', color1: 'primary', color2:'' },
    { id: 2, text: 'Secondary', class: 'right', color: 'outline-secondary', color1: 'secondary', color2:'' },
    { id: 3, text: 'Info', class: 'bottom', color: 'outline-info', color1: 'info', color2:'bs-popover-auto' },
    { id: 4, text: 'Warning', class: 'left', color: 'outline-warning', color1: 'warning', color2:'' },
    { id: 4, text: 'Success', class: 'top', color: 'outline-success', color1: 'success', color2:'' },
    { id: 4, text: 'Danger', class: 'top', color: 'outline-danger', color1: 'danger', color2:'' },
  ];`
export const popover3 = `<div className="btn-list">
    {Colredalerts.map((idx) => (
        <OverlayTrigger key={Math.random()} placement={idx.class} trigger="click" overlay={<Popover className={'popover-$#38{idx.color1}'}>
            <Popover.Header as="h3">Color Background</Popover.Header>
            <Popover.Body>Popover with {idx.text} background.</Popover.Body>
        </Popover>}>
            <Button variant={idx.color1}>{idx.text} </Button>
        </OverlayTrigger>
    ))}
</div>`
export const datapopover3 = `
interface popover2 {
    id: number
    text: string
    class: string
    color1: string
}
export const Colredalerts = [
  { id: 1, text: 'Primary', class: 'top', color1: 'primary' },
  { id: 2, text: 'Secondary', class: 'right', color1: 'secondary' },
  { id: 3, text: 'Info', class: 'bottom', color1: 'info' },
  { id: 4, text: 'Warning', class: 'left', color1: 'warning' },
  { id: 4, text: 'Success', class: 'top', color1: 'success' },
  { id: 4, text: 'Danger', class: 'right', color1: 'danger' },
  { id: 4, text: 'Teal', class: 'bottom', color1: 'teal' },
  { id: 4, text: 'Purple', class: 'left', color1: 'purple' },
];`
export const popover4 = `<div className="btn-list">
    {Colredalerts.map((idx) => (
        <OverlayTrigger key={Math.random()} placement={idx.class} trigger="click" overlay={<Popover className={'popover-$#38{idx.color1}-light'} id="tooltip-disabled">
            <Popover.Header as="h3">Light Background</Popover.Header>
            <Popover.Body>Popover with light {idx.text} background.</Popover.Body>
        </Popover>}>
            <Button variant='' className={'btn btn-$#38{idx.color1}-light btn-wave'}>{idx.text} </Button>
        </OverlayTrigger>
    ))}
</div>`
export const datapopover4 = `
interface popover4 {
    id: number
    text: string
    class: string
    color1: string
}
export const Colredalerts = [
  { id: 1, text: 'Primary', class: 'top', color1: 'primary' },
  { id: 2, text: 'Secondary', class: 'right', color1: 'secondary' },
  { id: 3, text: 'Info', class: 'bottom', color1: 'info' },
  { id: 4, text: 'Warning', class: 'left', color1: 'warning' },
  { id: 4, text: 'Success', class: 'top', color1: 'success' },
  { id: 4, text: 'Danger', class: 'right', color1: 'danger' },
  { id: 4, text: 'Teal', class: 'bottom', color1: 'teal' },
  { id: 4, text: 'Purple', class: 'left', color1: 'purple' },
];`
export const popover5 = ` {Dismissiblealerts.map((idx) => (
    <OverlayTrigger rootClose={true} trigger="click" placement={idx.class} key={Math.random()}
        overlay={<Popover>
            <Popover.Header as="h3"> Dismissible Popover</Popover.Header>
            <Popover.Body>
                And here's some amazing content. It's very engaging. Right?
            </Popover.Body>
        </Popover>}>
        <Button variant={idx.color} className="btn  btn-wave">Popover Dismiss</Button>
    </OverlayTrigger>
))}`
export const datapopover5 = `
interface popover5 {
    id: number
    class: string
    color: string
}
export const Dismissiblealerts = [
  { id: 1, color: 'primary', class: 'top' },
  { id: 2, color: 'secondary', class: 'right' },
  { id: 3, color: 'info', class: 'bottom' },
  { id: 4, color: 'warning', class: 'left' },
];`
export const popover6 = ` <OverlayTrigger placement='right' 
    overlay={<Popover id="tooltip-disabled">
    <Popover.Body>
        Disabled Popover!
    </Popover.Body>
    </Popover>}>
    <span className="d-inline-block">
        <Button disabled style={{ 
          pointerEvents: 'none' }}>
            Disabled button
        </Button>
    </span>
</OverlayTrigger>`
export const popover7 = `<OverlayTrigger placement='top' trigger="click" overlay={<Popover className='popover-primary only-body' id="tooltip-disabled">
    <Popover.Body>This popover is used to provide details about this icon.</Popover.Body>
</Popover>}>
    <Link className="me-4" to="#">
        <svg xmlns="http://www.w3.org/2000/svg" className="svg-primary" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
            <path d="M0 0h24v24H0V0z" fill="none" /><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" /></svg>
    </Link>
</OverlayTrigger>
<OverlayTrigger placement='top' trigger="click" overlay={<Popover className='popover-secondary only-body' id="tooltip-disabled">
    <Popover.Body>This popover is used to provide details about this icon.</Popover.Body>
</Popover>}>
    <Link className="me-4" to="#" >
        <svg xmlns="http://www.w3.org/2000/svg" className="svg-secondary" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
    </Link>
</OverlayTrigger>`

export const progress1 = `<ProgressBar now={0} className="progress mb-3" />
<ProgressBar now={25} className="progress mb-3" />
<ProgressBar now={50} className="progress mb-3" />
<ProgressBar now={75} className="progress mb-3" />
<ProgressBar now={100} className="progress mb-0" />`
export const progress2 = `<ProgressBar  variant='secondary' now={20} className="progress mb-3" />
<ProgressBar  variant='warning' now={40} className="progress mb-3" />
<ProgressBar  variant='info' now={60} className="progress mb-3" />
<ProgressBar  variant='success' now={80} className="progress mb-3" />
<ProgressBar  variant='danger' now={100} className="progress mb-0" />`
export const progress3 = `<ProgressBar striped variant='primary' now={10} className="progress mb-3" />
<ProgressBar striped variant='secondary' now={25} className="progress mb-3" />
<ProgressBar striped variant='success' now={50} className="progress mb-3" />
<ProgressBar striped variant='info' now={75} className="progress mb-3" />
<ProgressBar striped variant='warning' now={100} className="progress mb-0" />`
export const progress4 = `<ProgressBar  variant='primary' now={10} className="progress progress-xs mb-3" />
<ProgressBar  variant='primary' now={25} className="progress progress-sm mb-3" />
<ProgressBar  variant='primary' now={50} className="progress  mb-3" />
<ProgressBar  variant='primary' now={75} className="progress progress-lg mb-3" />
<ProgressBar  variant='primary' now={100}className="progress progress-xl mb-0" />`
export const progress5 = `<ProgressBar variant='primary' now={10} label={10} className="progress mb-3" />
<ProgressBar variant='secondary' now={20} label={20} className="progress mb-3" />
<ProgressBar variant='success' now={40} label={40%} className="progress mb-3" />
<ProgressBar variant='info' now={60} label={60}% className="progress mb-3" />
<ProgressBar variant='warning' now={80} label={80%} className="progress mb-0" />`
export const progress6 = `{Multipleprogress.map((idx) => (
    <ProgressBar className={'progress-stacked progress-$#38{idx.size} mb-3'} key={Math.random()}>
        <ProgressBar variant={idx.class1} now={idx.now1} key={1} />
        <ProgressBar variant={idx.class2} now={idx.now2} key={2} />
        <ProgressBar variant={idx.class3} now={idx.now3} key={3} />
    </ProgressBar>
))}`
export const dataprogress6 = `
interface progress6 {
    class1: string
    class2: string
    class3: string
    now1: string
    now2: string
    now3: string
    size: string
}
export const Multipleprogress= [
    { class1: "primary", class2: 'secondary', class3: 'success',
       now1: 5, now2: 10, now3: 15, size: "xs" },
    { class1: "warning", class2: 'info', class3: 'danger', 
      now1: 10, now2: 15, now3: 20, size: "sm" },
    { class1: "info", class2: 'success', class3: 'primary', 
      now1: 15, now2: 20, now3: 25, size: "" },
    { class1: "purple", class2: 'teal', class3: 'orange', 
      now1: 20, now2: 25, now3: 30, size: "lg" },
    { class1: "success", class2: 'danger', class3: 'warning', 
      now1: 25, now2: 30, now3: 35, size: "xl" },
  ];`
export const progress7 = `<ProgressBar variant='' className="progress mb-3" animated now={10} />
<ProgressBar variant='secondary' className="progress mb-3" animated now={20} />
<ProgressBar variant='success' className="progress mb-3" animated now={40} />
<ProgressBar variant='info' className="progress mb-3" animated now={60} />
<ProgressBar variant='warning' className="progress" animated now={80} />`
export const progress8 = ` <ProgressBar  variant='primary-gradient' className="progress mb-3" animated now={10} />
 <ProgressBar  variant='secondary-gradient' className="progress mb-3" animated now={20} />
 <ProgressBar  variant='success-gradient' className="progress mb-3" animated now={40} />
 <ProgressBar  variant='info-gradient' className="progress mb-3" animated now={60} />
 <ProgressBar  variant='warning-gradient' className="progress" animated now={80} />`
export const progress9 = `<ProgressBar  variant='primary-gradient' className="progress mb-3 progress-animate" 
 animated now={10} />
 <ProgressBar  variant='secondary-gradient' className="progress mb-3 progress-animate" 
  animated now={20} />
 <ProgressBar  variant='success-gradient' className="progress mb-3 progress-animate" 
  animated now={40} />
 <ProgressBar  variant='info-gradient' className="progress mb-3 progress-animate" 
  animated now={60} />
 <ProgressBar  variant='warning-gradient' className="progress  progress-animate" 
  animated now={80} />`
export const progress10 = `<div className="progress progress-sm progress-custom mb-5 progress-animate">
    <h6 className="progress-bar-title">Mobiles</h6>
    <ProgressBar variant="primary" className="w-100 custom-height1" now={50} />
</div>
<div className="progress progress-sm progress-custom mb-5 progress-animate">
    <h6 className="progress-bar-title bg-secondary">Watches</h6>
    <ProgressBar variant="secondary" className="w-100 custom-height1" now={60} />
</div>
<div className="progress progress-sm progress-custom mb-5 progress-animate">
    <h6 className="progress-bar-title bg-success">Shirts</h6>
    <ProgressBar variant="success" className="w-100 custom-height1" now={70} />
</div>`
export const progress11 = `{CustomProgress2data.map((idx) => (
    <div className="progress progress-bar progress-sm mb-4" key={Math.random()} >
        <div className={'progress-item-1 bg-$#38{idx.class}'}></div>
        <div className={'progress-item-2 bg-$#38{idx.class2}'}></div>
        <div className={'progress-item-3 bg-$#38{idx.class1}'}></div>
        <ProgressBar variant={idx.class} now={idx.now} />
    </div>
))}`
export const dataprogress11 = `
interface progress11 {
    class: string
    class2: string
    now: string
}
  export const CustomProgress2data = [
    { class: 'primary', now: 50, class1: '' , class2:''},
    { class: 'secondary', now: 60, class1: '' , class2:'secondary'},
    { class: 'success', now: 70, class1: '' , class2:'success'},
    { class: 'info', now: 80, class1: 'info' , class2:'info'},
    { class: 'warning', now: 90, class1: 'warning' , class2:'warning'},
  ];`
export const progress12 = ` <div className="progress progress-lg mb-5 custom-progress-3 progress-animate" role="progressbar">
    <div className="progress-bar bg-primary" style={{ width: "50%" }}>
        <div className="progress-bar-value">50%</div>
    </div>
</div>
<div className="progress progress-lg mb-5 custom-progress-3 progress-animate" role="progressbar">
    <div className="progress-bar bg-secondary" style={{ width: "60%" }}>
        <div className="progress-bar-value secondary">60%</div>
    </div>
</div>
<div className="progress progress-lg custom-progress-3 progress-animate" role="progressbar" >
    <div className="progress-bar bg-success" style={{ width: "70%" }}>
        <div className="progress-bar-value success">70%</div>
    </div>
</div>`
export const progress13 = `<div className="progress progress-xl mb-3 progress-animate custom-progress-4" role="progressbar">
    <div className="progress-bar bg-primary-gradient" style={{ width: "10%" }}></div>
    <div className="progress-bar-label">10%</div>
</div>
<div className="progress progress-xl mb-3 progress-animate custom-progress-4 secondary" role="progressbar" >
    <div className="progress-bar bg-secondary-gradient" style={{ width: "20%" }}></div>
    <div className="progress-bar-label">20%</div>
</div>
<div className="progress progress-xl mb-3 progress-animate custom-progress-4 success" role="progressbar">
    <div className="progress-bar bg-success-gradient" style={{ width: "40%" }}></div>
    <div className="progress-bar-label">40%</div>
</div>
<div className="progress progress-xl mb-3 progress-animate custom-progress-4 info" role="progressbar">
    <div className="progress-bar bg-info-gradient" style={{ width: "60%" }}></div>
    <div className="progress-bar-label">60%</div>
</div>
<div className="progress progress-xl mb-3 progress-animate custom-progress-4 warning" role="progressbar">
    <div className="progress-bar bg-warning-gradient" style={{ width: "80%" }}></div>
    <div className="progress-bar-label">80%</div>
</div>
<div className="progress progress-xl progress-animate custom-progress-4 danger" role="progressbar">
    <div className="progress-bar bg-danger-gradient" style={{ width: "100%" }}></div>
    <div className="progress-bar-label text-fixed-white">100%</div>
</div>`
export const progress14 = `<h6 className="fw-semibold mb-2">Project Dependencies</h6>
<ProgressBar className="progress-stacked progress-xl mb-5" >
    <ProgressBar variant="primary" now={25} label={'$#38{25}%'} key={1} />
    <ProgressBar variant="secondary" now={35} label={'$#38{35}%'} key={2} />
    <ProgressBar variant="danger" now={40} label={'$#38{40}%'} key={3} />
</ProgressBar>
<Row className="justify-content-center">
    <Col xl={5}>
        <div className="border p-3">
            <p className="fs-12 fw-semibold mb-0 text-muted">
               Html
               <span className="float-end fs-10 fw-normal">
                 25%
               </span>
            </p>
            <ProgressBar className="progress progress-xs mb-4 progress-animate" variant="primary" 
              now={25} />
            <p className="fs-12 fw-semibold mb-0 text-muted">
               Css
               <span className="float-end fs-10 fw-normal">
                  35%
                </span>
            </p>
            <ProgressBar className="progress progress-xs mb-4 progress-animate" variant="secondary" 
              now={35} />
            <p className="fs-12 fw-semibold mb-0 text-muted">
               Js
               <span className="float-end fs-10 fw-normal">
                  40%
                </span>
            </p>
            <ProgressBar className="progress progress-xs mb-4 progress-animate" variant="danger" 
              now={40} />
        </div>
    </Col>
</Row>`

export const spinner1 = `<div className="spinner-border" role="status">
 <span className="visually-hidden">Loading...</span>
</div>`
export const spinner2 = `{Colorspinner.map((idx) => (
    <div className={'spinner-border me-2 text-$#38{idx.color}'} role="status" key={Math.random()}>
        <span className="visually-hidden">Loading...</span>
    </div>
))}`
export const dataspinner2 = `
interface spinner2 {
    id: number
    color: string
}
export const Colorspinner=[
  {id:1,color:'primary'},
  {id:2,color:'secondary'},
  {id:3,color:'success'},
  {id:4,color:'danger'},
  {id:5,color:'warning'},
  {id:6,color:'info'},
  {id:7,color:'light'},
  {id:8,color:'dark'}
];`
export const spinner3 = `<div className="spinner-grow" role="status">
    <span className="visually-hidden">Loading...</span>
</div>`
export const spinner4 = `{Colorspinner.map((idx) => (
    <div className={'spinner-grow me-1 text-$#38{idx.color}'} role="status" key={Math.random()}>
        <span className="visually-hidden">Loading...</span>
    </div>
))}`
export const dataspinner4 = `
interface spinner4 {
    id: number
    color: string
}
export const Colorspinner=[
  {id:1,color:'primary'},
  {id:2,color:'secondary'},
  {id:3,color:'success'},
  {id:4,color:'danger'},
  {id:5,color:'warning'},
  {id:6,color:'info'},
  {id:7,color:'light'},
  {id:8,color:'dark'}
];`
export const spinner5 = `<div className="d-flex justify-content-center mb-4">
    <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
    </div>
</div>
<div className="d-flex align-items-center">
    <strong>Loading...</strong>
    <div className="spinner-border ms-auto" role="status" aria-hidden="true"></div>
</div>`
export const spinner6 = ` <div className="clearfix mb-4">
    <div className="spinner-border float-end" role="status">
        <span className="visually-hidden">Loading...</span>
    </div>
</div>
<div className="clearfix">
    <div className="spinner-border float-start" role="status">
        <span className="visually-hidden">Loading...</span>
    </div>
</div>`
export const spinner7 = `<div className="text-center">
    <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
    </div>
</div>`
export const spinner8 = `<div className="spinner-border spinner-border-sm me-4" role="status">
    <span className="visually-hidden">Loading...</span>
</div>
<div className="spinner-grow spinner-grow-sm me-4" role="status">
    <span className="visually-hidden">Loading...</span>
</div>
<div className="spinner-border me-4"
    style={{ width: '3rem', height: '3rem' }}
    role="status">
    <span className="visually-hidden">Loading...</span>
</div>
<div className="spinner-grow"
    style={{ width: '3rem', height: '3rem' }}
    role="status">
    <span className="visually-hidden">Loading...</span>
</div>`
export const spinner9 = ` <div className="spinner-border m-5" role="status">
    <span className="visually-hidden">Loading...</span>
</div>`
export const spinner10 = `<div className="btn-list">
    <Button variant='' className="btn btn-primary-light" type="button" disabled>
        <span className="spinner-border spinner-border-sm align-middle" role="status"
            aria-hidden="true"></span>
        <span className="visually-hidden">Loading...</span>
    </Button>
    <Button variant='' className="btn btn-primary-light" type="button" disabled>
        <span className="spinner-border spinner-border-sm align-middle" role="status"
            aria-hidden="true"></span> Loading...
    </Button>
    <Button variant='' className="btn btn-primary-light" type="button" disabled>
        <span className="spinner-grow spinner-grow-sm align-middle" role="status"
            aria-hidden="true"></span>
        <span className="visually-hidden">Loading...</span>
    </Button>
    {Buttonspinner.map((idx) => (
        <Button variant={idx.color} className="btn" type="button" disabled key={Math.random()}>
            <span className="spinner-grow spinner-grow-sm align-middle" role="status"
                aria-hidden="true"></span> Loading...
        </Button>
    ))}
</div>`
export const dataspinner10 = `
interface spinner10 {
    id: number
    color: string
    class: string
}
export const Buttonspinner = [
  { id: 1, color: 'primary-light', class: '' },
  { id: 2, color: 'secondary-light', class: '' },
  { id: 3, color: 'success-light', class: '' },
  { id: 4, color: 'info-light', class: '' },
  { id: 5, color: 'warning-light', class: '' },
  { id: 6, color: 'danger-light', class: '' },
  { id: 7, color: 'light', class: '' },
  { id: 8, color: 'dark', class: 'text-dark' }
];`

export const Objectfit1 = `<img src={media28}
className="object-fit-contain border rounded" 
alt="..."/>`
export const Objectfit2 = `<img src={media28}
 className="object-fit-cover border rounded" alt="..."/>`
export const Objectfit3 = `<img src={media28} 
className="object-fit-fill border rounded" alt="..."/>`
export const Objectfit4 = ` <img src={media28} 
className="object-fit-scale border rounded" alt="..."/>`
export const Objectfit5 = `<img src={media28} 
className="object-fit-none border rounded" alt="..."/>`
export const Objectfit6 = `<img src={media28} 
className="object-fit-sm-contain border
 rounded" alt="..."/>`
export const Objectfit7 = `<img src={media28} 
className="object-fit-md-contain border 
rounded" alt="..."/>`
export const Objectfit8 = `<img src={media28} 
className="object-fit-lg-contain border 
rounded" alt="..."/>`
export const Objectfit9 = ` <img src={media28} 
className="object-fit-xl-contain border 
rounded" alt="..."/>`
export const Objectfit10 = `<img src={media28} 
className="object-fit-xxl-contain border
 rounded" alt="..."/>`
export const Objectfit11 = `<video src={video1} 
   className="object-fit-contain rounded 
   border" autoPlay>
</video>`
export const Objectfit12 = `<video src={video1} 
     className="object-fit-cover rounded 
      border" autoPlay>
</video>`
export const Objectfit13 = `<video src={video1} 
   className="object-fit-fill rounded 
   border" autoPlay>
</video>`
export const Objectfit14 = `<video src={video1} 
   className="object-fit-scale rounded 
  border" autoPlay>
</video>`
export const Objectfit15 = `<video src={video1} 
   className="object-fit-none 
   rounded border" autoPlay>
</video>`


export const Typography1 = `<h1 className="mb-3">h1. Bootstrap heading</h1>
<h2 className="mb-3">h2. Bootstrap heading</h2>
<h3 className="mb-3">h3. Bootstrap heading</h3>
<h4 className="mb-3">h4. Bootstrap heading</h4>
<h5 className="mb-3">h5. Bootstrap heading</h5>
<h6 className="mb-0">h6. Bootstrap heading</h6>`
export const Typography2 = `<p className="h1 mb-3">h1. Bootstrap heading</p>
<p className="h2 mb-3">h2. Bootstrap heading</p>
<p className="h3 mb-3">h3. Bootstrap heading</p>
<p className="h4 mb-3">h4. Bootstrap heading</p>
<p className="h5 mb-3">h5. Bootstrap heading</p>
<p className="h6 mb-0">h6. Bootstrap heading</p>`
export const Typography3 = `<h1 className="display-1">Display 1</h1>
 <h1 className="display-2">Display 2</h1>
 <h1 className="display-3">Display 3</h1>
 <h1 className="display-4">Display 4</h1>
 <h1 className="display-5">Display 5</h1>
 <h1 className="display-6">Display 6</h1>`
export const Typography4 = ` <h3>
    Fancy display heading <small className="text-muted">With faded secondary text</small>
</h3>`
export const Typography5 = ` <p>You can use the mark tag to <mark>highlight</mark> text.</p>
<p><del>This line of text is meant to be treated as deleted text.</del>
</p>
<p><s>This line of text is meant to be treated as no longer
    accurate.</s>
</p>
<p><ins>This line of text is meant to be treated as an addition to the
    document.</ins></p>
<p><u>This line of text will render as underlined.</u></p>
<p><small>This line of text is meant to be treated as fine
    print.</small>
</p>
<p><strong>This line rendered as bold text.</strong></p>
<p className="mb-0"><em>This line rendered as italicized text.</em></p>`
export const Typography6 = `<p className="fs-1 mb-2">.fs-1 text</p>
<p className="fs-2 mb-2">.fs-2 text</p>
<p className="fs-3 mb-2">.fs-3 text</p>
<p className="fs-4 mb-2">.fs-4 text</p>
<p className="fs-5 mb-2">.fs-5 text</p>
<p className="fs-6 mb-0">.fs-6 text</p>`
export const Typography7 = ` <p className="lead mb-0">
    <b>This is a lead paragraph. It stands out from regular paragraphs</b>.There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, 
    or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.
</p>`
export const Typography8 = `<figure className="blockquote-container">
    <blockquote className="blockquote mb-2">
        <h6>
           The greatest glory in living lies not in never falling, but in rising every time we fall.
        </h6>
    </blockquote>
    <figcaption className="blockquote-footer mt-0 mb-0 text-muted op-7">
        <cite title="Source Title">Nelson Mandela</cite>
    </figcaption>
</figure>`
export const Typography9 = `<figure className="blockquote-container text-end">
    <blockquote className="blockquote mb-2">
        <h6>
          The greatest glory in living lies not in never falling, but in rising every time we fall.
        </h6>
    </blockquote>
    <figcaption className="blockquote-footer mt-0 mb-0 text-muted op-7">
       <cite title="Source Title">
           Nelson Mandela
        </cite>
    </figcaption>
</figure>`
export const Typography10 = `{CustomBlockquotes.map(item => (
    <Col xl={4} key={item.id}>
        <ShowCode title={item.title} className="" 
          reactCode={Typography10} 
          customCardHeaderClass="justify-content-between">
            <blockquote className={'blockquote 
             custom-blockquote $#38{item.color} mb-0 
             text-center'}>
                <h6>
                  The future belongs to those who 
                  believe in the beauty of their dreams..
                </h6>
                <footer className="blockquote-footer mt-3
                 fs-14 text-muted op-7 mb-0">
                    Someone famous as 
                     <cite title="Source Title">
                        -Eleanor Roosevelt
                     </cite>
                </footer>
                <span className="quote-icon">
                   <i className="ri-information-line"></i>
                </span>
            </blockquote>
        </ShowCode>
    </Col>
))}`
export const dataTypography10 = `
interface Typography10 {
    id: number
    title: string
    color: string
}
export const CustomBlockquotes = [
    { id: 1, title: "Primary Blockquote Blockquote",
      color: "primary" },
    { id: 2, title: "Secondary Blockquote",
      color: "secondary" },
    { id: 3, title: "Warning Blockquote",
      color: "warning" },
    { id: 4, title: "Success Blockquote",
      color: "success" },
    { id: 5, title: "Info Blockquote",
      color: "info" },
    { id: 6, title: "Danger Blockquote",
      color: "danger" },
]`
export const Typography11 = `<dl className="row mb-0">
    <dt className="col-sm-3">Description lists</dt>
    <dd className="col-sm-9">A description list is perfect for defining terms.</dd>
    <dt className="col-sm-3">Term</dt>
    <dd className="col-sm-9">
        <p>Definition for the term.</p>
        <p>And some more placeholder definition text.</p>
    </dd>
    <dt className="col-sm-3">Another term</dt>
    <dd className="col-sm-9">This definition is short, so no extra paragraphs or
        anything.</dd>
    <dt className="col-sm-3 text-truncate">Truncated term is truncated</dt>
    <dd className="col-sm-9">This can be useful when space is tight. Adds an
        ellipsis at
        the end.</dd>
    <dt className="col-sm-3">Nesting</dt>
    <dd className="col-sm-9 mb-0">
        <dl className="row mb-0">
            <dt className="col-sm-4">Nested definition list</dt>
            <dd className="col-sm-8 mb-0">I heard you like definition lists. Let me put a
                definition list inside your definition list.</dd>
        </dl>
    </dd>
</dl>`
export const Typography12 = `<ul className="list-unstyled">
    <li>This is a list.</li>
    <li>It appears completely unstyled.</li>
    <li>Structurally, it's still a list.</li>
    <li>However, this style only applies to immediate child elements.</li>
    <li className="mb-2">Nested lists:
        <ul>
            <li>are unaffected by this style</li>
            <li>will still show a bullet</li>
            <li>and have appropriate left margin</li>
        </ul>
    </li>
    <li>This may still come in handy in some situations.</li>
</ul>`
export const Typography13 = `<p><abbr title="attribute">attr</abbr></p>
<p className="mb-0"><abbr title="HyperText Markup Language" className="initialism">HTML</abbr></p>`
export const Typography14 = `<ul className="list-inline mb-0">
    <li className="list-inline-item">This is a list item.</li>
    <li className="list-inline-item">And another one.</li>
    <li className="list-inline-item">But they're displayed inline.</li>
</ul>`
export const Typography15 = `<p className="mb-1">
   Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum dolorem fuga iste obcaecati natus 
   officiis adipisci voluptatibus ipsum, architecto veniam delectus vel dolor magni a vero  harum.
</p>
<div className="text-success">
    <hr />
</div>
<p className=" mb-1">
    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iusto perspiciatis, magni numquam 
    quos perferendis nulla magnam odit amet excepturi quisquam provident.
</p>
<hr className="text-danger border-2 opacity-50" />
<p className="mb-0">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus aliquid consequatur aut
    doloremque assumenda voluptatem, id qui vero adipisci! Nostrum ipsam praesentium!
</p>
<hr className="border-primary border-3 opacity-75" />`
export const Typography16 = `<p className="text-lowercase">Lowercased text.</p>
<p className="text-uppercase">Uppercased text.</p>
<p className="text-capitalize mb-0">CapiTaliZed text.</p>`
export const Typography17 = `<p className="text-decoration-underline">This text has a line underneath it.
</p>
<p className="text-decoration-line-through">This text has a line going
    through
    it.
</p>
<Link to="#" className="text-decoration-none">This link has its text
    decoration
    removed
</Link>`
export const Typography18 = `<p className="fw-bold">Bold text.</p>
<p className="fw-bolder">Bolder weight text (relative to the parent element).</p>
<p className="fw-semibold">Semibold weight text.</p>
<p className="fw-normal">Normal weight text.</p>
<p className="fw-light">Light weight text.</p>
<p className="fw-lighter">Lighter weight text (relative to the parent element).</p>
<p className="fst-italic">Italic text.</p>
<p className="fst-normal mb-0">Text with normal font style</p>`
export const Typography19 = ` <p className="lh-1">This is a long paragraph written to show how the line-height of
    an
    element is affected by our utilities. Classes are applied to the element
    itself
    or sometimes the parent element. These classes can be customized as needed
    with
    our utility API.
</p>
<p className="lh-sm">This is a long paragraph written to show how the line-height of
    an
    element is affected by our utilities. Classes are applied to the element
    itself
    or sometimes the parent element. These classes can be customized as needed
    with
    our utility API.
</p>
<p className="lh-base">This is a long paragraph written to show how the line-height
    of
    an element is affected by our utilities. Classes are applied to the element
    itself or sometimes the parent element. These classes can be customized as
    needed with our utility API.
</p>
<p className="lh-lg mb-0">This is a long paragraph written to show how the
    line-height
    of an
    element is affected by our utilities. Classes are applied to the element
    itself
    or sometimes the parent element. These classes can be customized as needed
    with
    our utility API.
</p>`
export const Typography20 = `<p className="font-monospace mb-0">
   This is in monospace
</p>`
export const Typography21 = `<p className="text-muted mb-0">
    Muted text with a 
    <Link to="#" 
     className="text-reset 
      text-decoration-underline text-dark">
        reset link
    </Link>.
</p>`
export const Typography22 = `<p className="visible mb-0">
   This is visible text 
</p>`
export const Typography23 = `<p className="invisible mb-0">
   This is invisible text
</p>`
export const Typography24 = `<p className="text-start">Start aligned text on all viewport sizes.</p>
<p className="text-center">Center aligned text on all viewport sizes.</p>
<p className="text-end">End aligned text on all viewport sizes.</p>
<p className="text-sm-start">Start aligned text on viewports sized SM (small) or
    wider.
</p>
<p className="text-md-start">Start aligned text on viewports sized MD (medium) or
    wider.
</p>
<p className="text-lg-start">Start aligned text on viewports sized LG (large) or
    wider.
</p>
<p className="text-xl-start">Start aligned text on viewports sized XL (extra-large)
    or
    wider.
</p>`
export const Typography25 = `<div className="badge bg-primary text-wrap mb-3" style={{ width: 96 }}>
    This text should wrap.
</div>
<p className="text-muted mb-2"> use class <code>.text-nowrap</code> to prevent text from wrapping</p>
<div className="text-nowrap bg-light border" style={{ width: 130 }}>
    This text should overflow the parent.
</div>`
export const Typography26 = `<p className="text-break mb-0">
    mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm
</p>`


export const tooltip1 = `<div className="btn-list">
    {Tooltipdirtooltip.map((idx) => (
        <OverlayTrigger placement={idx.text} overlay={<Tooltip>Tooltip on {idx.text} </Tooltip>} key={Math.random()}>
            <Button type="button" className="btn btn-primary btn-wave">
                Tooltip on {idx.text}
            </Button>
        </OverlayTrigger>
    ))}
</div>`
export const datatooltip1 = `
interface tooltip1 {
    id: number
    text: string
}
export const Tooltipdirtooltip = [
  { id: 1, text: 'top' },
  { id: 2, text: 'right' },
  { id: 3, text: 'bottom' },
  { id: 4, text: 'left' }
];`
export const tooltip2 = `<div className="btn-list">
    <OverlayTrigger placement="top" overlay={<Tooltip className='tooltip-primary'>Primary Tooltip </Tooltip>}>
        <Button type="button" variant='primary' className="btn  btn-wave">
            Primary Tooltip
        </Button>
    </OverlayTrigger>
    <OverlayTrigger placement="right" overlay={<Tooltip className='tooltip-secondary'>Secondary Tooltip </Tooltip>}>
        <Button type="button" variant='secondary' className="btn  btn-wave">
            Secondary Tooltip
        </Button>
    </OverlayTrigger>
    <OverlayTrigger placement="bottom" overlay={<Tooltip className='tooltip-warning'>Warning Tooltip </Tooltip>}>
        <Button type="button" variant='warning' className="btn  btn-wave">
            Warning Tooltip
        </Button>
    </OverlayTrigger>
    <OverlayTrigger placement="bottom" overlay={<Tooltip className='tooltip-info'>Info Tooltip </Tooltip>}>
        <Button type="button" variant='info' className="btn  btn-wave">
            Info Tooltip
        </Button>
    </OverlayTrigger>
    <OverlayTrigger placement="top" overlay={<Tooltip className='tooltip-success'>Success Tooltip </Tooltip>}>
        <Button type="button" variant='success' className="btn  btn-wave">
            Success Tooltip
        </Button>
    </OverlayTrigger>
    <OverlayTrigger placement="top" overlay={<Tooltip className='tooltip-danger'>Danger Tooltip </Tooltip>}>
        <Button type="button" variant='danger' className="btn  btn-wave">
            Danger Tooltip
        </Button>
    </OverlayTrigger>
    <OverlayTrigger placement="top" overlay={<Tooltip className='tooltip-light'>Light Tooltip </Tooltip>}>
        <Button type="button" variant='light' className="btn  btn-wave">
            Light Tooltip
        </Button>
    </OverlayTrigger>
    <OverlayTrigger placement="top" overlay={<Tooltip className='tooltip-dark'>Dark Tooltip </Tooltip>}>
        <Button type="button" variant='dark' className="btn  btn-wave">
            Dark Tooltip
        </Button>
    </OverlayTrigger>
</div>`
export const tooltip3 = ` <p className="text-muted mb-0">
    Hover on the link to view the
    <OverlayTrigger placement="top" 
      overlay={<Tooltip className='tooltip-primary'>
         Link Tooltip 
        </Tooltip>}>
        <Link to="#" className="text-primary ms-1 
         d-inline-flex">
          Tooltip
        </Link>
    </OverlayTrigger>
</p>`
export const tooltip4 = `{SVGtooltip.map((idx) => (
    <OverlayTrigger key={Math.random()} placement="top" 
      overlay={<Tooltip className={'tooltip-$#38{idx.color}'}>
        {idx.text} 
       </Tooltip>}>
        <Link to="#" className="me-3">
            <svg xmlns="http://www.w3.org/2000/svg" 
             className={'svg-$#38{idx.color}'} height="24px" 
             viewBox="0 0 24 24" width="24px" fill="#000000">
                <path d="M0 0h24v24H0V0z" fill="none" /><path
                    d={idx.class} /></svg>
        </Link>
    </OverlayTrigger>
))}`
export const datatooltip4 = `
interface tooltip4 {
    id: number
    class: string
    color: string
    text: string
}
export const SVGtooltip = [
  { id: 1, 
   class: 'M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 
    3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z', 
   color: 'primary', text: 'Home' 
  },
  { id: 2, 
   class: 'M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 
   2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5
   8-5v10z',
    color: 'secondary', text: 'Message' 
  },
  { id: 3, 
    class: 'M20,9V6h-2v3h-3v2h3v3h2v-3h3V9H20z M9,12c2.21,0,
     4-1.79,4-4c0-2.21-1.79-4-4-4S5,
     5.79,5,8C5,10.21,6.79,12,9,12z
    M9,6 c1.1,0,2,0.9,2,2c0,1.1-0.9,
    2-2,2S7,9.1,7,8C7,6.9,7.9,6,9,6z
    M15.39,14.56C13.71,13.7,11.53,13,
    9,13c-2.53,0-4.71,0.7-6.39,1.56
    C1.61,15.07,1,16.1,1,17.22V20h16v-2.
    78C17,16.1,16.39,15.07,15.39,
    14.56z M15,18H3v-0.78c0-0.38,0.2-0.72,
    0.52-0.88 C4.71,15.73,6.63,15,
    9,15c2.37, 0,4.29,0.73,5.48,1.34C14.8,
    16.5,15,16.84,15,17.22V18z',
     color: 'warning', text: 'Add User' 
  },
  { id: 4, 
    class: 'M4.01 6.03l7.51 3.22-7.52-1 .01-2.22m7.5 8.72L4
     17.97v-2.22l7.51-1M2.01 3L2 10l15 2-15 2 .01 7L23 
     12 2.01 3z',
    color: 'info', text: 'Send File'
  },
  { id: 5,
    class: 'M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 
     2-2-.9-2-2-2zm12
     0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 
     0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z', 
     color: 'success', text: 'Action' 
  },
];`
export const tooltip5 = ` <span className="d-inline-block">
    <Button disabled style={{ pointerEvents: 'none' }}>
        Disabled button
    </Button>
</span>`
export const tooltip6 = `<OverlayTrigger placement="top" 
 overlay={<Tooltip className="tooltip-primary">
   Alex Carey
 </Tooltip>}>
     <Link to="#"
         className="avatar avatar-md me-2 online 
          avatar-rounded">
         <img src={face12} alt="img" />
     </Link>
 </OverlayTrigger>
 <OverlayTrigger placement="top" 
  overlay={<Tooltip className="tooltip-primary">
    Marina Kai
   </Tooltip>}>
     <Link
         className="avatar avatar-lg me-2 online 
          avatar-rounded">
         <img src={face3} alt="img" />
     </Link>
 </OverlayTrigger>
 <OverlayTrigger placement="top" 
   overlay={<Tooltip className="tooltip-primary">
     Tim Cook
    </Tooltip>}>
     <Link to="#"
         className="avatar avatar-xl me-2 online 
          avatar-rounded">
         <img src={face15} alt="img" />
     </Link>
 </OverlayTrigger>`


export const toasts1 = `const Toasts = () => {
     const [show, setShow] = useState(false);
    return (
    <Fragment>
      <Button type="button" className="btn btn-primary 
      btn-wave" id="liveToastBtn" 
      onClick={() => setShow(true)}>
            Show live toast
       </Button>
       <Toast className="toast-container position-fixed 
        top-0 end-0 me-4 mt-4" onClose={() => setShow(false)} 
        show={show} delay={3000} autohide>
           <Toast.Header className="text-default mb-0">
               <img className="bd-placeholder-img rounded
                  me-2" src={favicon} alt="..." />
               <strong className="me-auto">azira</strong>
               <small>11 mins ago</small>
           </Toast.Header>
           <Toast.Body>
               Hello, world! This is a toast message.
           </Toast.Body>
       </Toast>
    </Fragment>
 )
};
export default Toasts; `
export const toasts2 = `const Toasts = () => {
    const [showC, setShowC] = useState(true);
    const toggleShowC = () => setShowC(!showC);

    const [showD, setShowD] = useState(true);
    const toggleShowD = () => setShowD(!showD);

    const [showE, setShowE] = useState(true);
    const toggleShowE = () => setShowE(!showE);

    const [showF, setShowF] = useState(true);
    const toggleShowF = () => setShowF(!showF);
    return (
    <Fragment>
      <Toast className="toast align-items-center
       text-bg-primary border-0 fade show mb-4"
       show={showC}>
          <div className="d-flex">
              <Toast.Body className=" text-fixed-white" >
                  Hello, world! This is Primary toast message. 
               </Toast.Body>
              <CloseButton aria-label="Close" 
               className="btn-closebtn-close-white
                me-2 m-auto" onClick={toggleShowC}>
              </CloseButton>
          </div>
      </Toast>
      <Toast className="toast align-items-center
        text-bg-secondary border-0 fade show mb-4"
        show={showD}>
          <div className="d-flex">
              <Toast.Body className=" text-fixed-white" >
                 Hello, world! This is Secondary 
                 toast message. 
               </Toast.Body>
              <CloseButton aria-label="Close"
               className="btn-close btn-close-white me-2 
               m-auto"
                onClick={toggleShowD}></CloseButton>
          </div>
      </Toast>
      <Toast className="toast align-items-center
       text-bg-success border-0 fade show mb-4" 
       show={showE}>
          <div className="d-flex">
              <Toast.Body className=" text-fixed-white" >
                Hello, world! This is Success toast message.
              </Toast.Body>
              <CloseButton aria-label="Close" 
                className="btn-close btn-close-white
                  me-2 m-auto" onClick={toggleShowE}>
              </CloseButton>
          </div>
      </Toast>
      <Toast className="toast align-items-center
       text-bg-info border-0 fade show mb-4" 
         show={showF}>
          <div className="d-flex">
              <Toast.Body className=" text-fixed-white" >
                Hello, world! This is info toast message. 
              </Toast.Body>
              <CloseButton aria-label="Close" 
               className="btn-close btn-close-white 
               me-2 m-auto" 
               onClick={toggleShowF}></CloseButton>
          </div>
      </Toast>
    </Fragment>
 )
};
export default Toasts;`
export const toasts3 = `const Toasts = () => {
    const [showA, setShowA] = useState(true);
    const toggleShowA = () => setShowA(!showA);
    return (
    <Fragment>
      <Toast show={showA} onClose={toggleShowA}
        className="toast show"
          role="alert" aria-live="assertive" 
           aria-atomic="true" data-bs-autohide="false">
          <Toast.Header className="text-default">
              <img src={favicon} alt="" className="me-2" 
                height="18" />
              <strong className="me-auto">azira</strong>
              <small>11 mins ago</small>
          </Toast.Header>
          <Toast.Body>
            Hello, world! This is a toast message.
          </Toast.Body>
      </Toast>
    </Fragment>
 )
};
export default Toasts;`
export const toasts4 = `const Toasts = () => {
    const [showG, setShowG] = useState(true);
    const toggleShowG = () => setShowG(!showG);

    const [showH, setShowH] = useState(true);
    const toggleShowH = () => setShowH(!showH);
    return (
    <Fragment>
     <ToastContainer className="toast-container
       position-static">
        <Toast show={showG} onClose={toggleShowG}
          className="toast fade show">
            <Toast.Header className="toast-header
             text-default">
                <img src={favicon} alt="" className="me-2"
                 height="18" />
                <strong className="me-auto">azira</strong>
                <small>just now</small>
            </Toast.Header>
            <Toast.Body> See? Just like this.</Toast.Body>
        </Toast>
        <Toast show={showH} onClose={toggleShowH} 
         className="toast fade show">
            <Toast.Header className="toast-header
              text-default">
                <img src={favicon} alt="" className="me-2"
                  height="18" />
                <strong className="me-auto">azira</strong>
                <small>2 seconds ago</small>
            </Toast.Header>
            <Toast.Body>
              Heads up, toasts will stack automatically
            </Toast.Body>
        </Toast>
    </ToastContainer>
    </Fragment>
 )
};
export default Toasts;`
export const toasts5 = `const Toasts = () => {
    const [showB, setShowB] = useState(true);
    const toggleShowB = () => setShowB(!showB);

    const [showI, setShowI] = useState(true);
    const toggleShowI = () => setShowI(!showI);
    return (
    <Fragment>
     <Toast show={showB} onClose={toggleShowB} 
       className="toast show" role="alert" 
       aria-live="assertive" aria-atomic="true" 
        data-bs-autohide="false">
         <Toast.Header className="text-default">
             <img src={favicon} alt="" className="me-2" 
              height="18" />
             <strong className="me-auto">azira</strong>
             <small>11 mins ago</small>
         </Toast.Header>
         <Toast.Body>
            Hello, world! This is a toast message.
         </Toast.Body>
     </Toast>
    </Fragment>
 )
};
export default Toasts;`
export const toasts6 = `const Toasts = () => {
    const [showI, setShowI] = useState(true);
    const toggleShowI = () => setShowI(!showI);

    const [showJ, setShowJ] = useState(true);
    const toggleShowJ = () => setShowJ(!showJ);
    return (
    <Fragment>
        <Toast role="alert" className="toast 
         align-items-center fade show mb-3" 
         show={showI}>
            <div className="d-flex">
                <Toast.Body className=" text-dark" >
                  Hello, world! This is a toast message.
                </Toast.Body>
                <CloseButton type="button" 
                  className="btn-close me-2 m-auto" 
                   onClick={toggleShowI}>
                </CloseButton>
            </div>
        </Toast>
        <div>
            <span className="my-4 text-muted">
                Alternatively, you can also add
                additional controls and components to
                toasts.
            </span>
        </div>
        <Toast className="toast fade show mt-2" 
          role="alert" aria-live="assertive" 
          show={showJ}>
            <Toast.Body>
                Hello, world! This is a toast message.
                <div className="mt-2 pt-2 border-top">
                    <Button type="button" 
                     className="btn btn-primary btn-sm
                      btn-wave me-2">
                      Take action<
                    /Button>
                    <Button type="button" className="btn 
                      btn-secondary
                      btn-sm btn-wave" onClick={toggleShowJ}>
                      Close
                    </Button>
                </div>
            </Toast.Body>
        </Toast>
    </Fragment>
 )
};
export default Toasts;`
export const toasts7 = `const Toasts = () => {
    const [show1, setShow1] = useState(false);
    const [show2, setShow2] = useState(false);
    const [show3, setShow3] = useState(false);
    const [show4, setShow4] = useState(false);
    const [show5, setShow5] = useState(false);
    const [show6, setShow6] = useState(false);
    return (
    <Fragment>
        <div className="btn-list">
            <Button type="button" variant='primary-light' 
              className="btn me-2 btn-wave" id="primaryToastBtn" 
              onClick={() => setShow1(true)}>
                Primary
            </Button>
            <Button variant='secondary-light' type="button"
             className="btn me-2 btn-wave" id="secondaryToastBtn" 
             onClick={() => setShow2(true)}>
               secondary
            </Button>
            <Button variant='warning-light' type="button" 
             className="btn  me-2 btn-wave" id="warningToastBtn" 
             onClick={() => setShow3(true)}>
               warning
            </Button>
            <Button variant='info-light' type="button"
              className="btn  me-2 btn-wave" id="infoToastBtn" 
              onClick={() => setShow4(true)}>
                 info
            </Button>
            <Button variant='success-light' type="button" 
              className="btn  me-2 btn-wave" id="successToastBtn" 
              onClick={() => setShow5(true)}>
                success
            </Button>
            <Button variant='danger-light' type="button" 
               className="btn me-2 btn-wave" id="dangerToastBtn" 
               onClick={() => setShow6(true)}>
                 danger
            </Button>
        </div>
        <ToastContainer className="toast-container position-fixed top-0 end-0 p-3">
            <Toast id="primaryToast" bg="primary-transparent" className="toast colored-toast"
                onClose={() => setShow1(false)} show={show1} delay={3000} autohide
                aria-atomic="true">
                <Toast.Header className="toast-header bg-primary text-fixed-white">
                    <img className="bd-placeholder-img rounded me-2" src={toggledark} alt="..." />
                    <strong className="me-auto">azira</strong>
                </Toast.Header>
                <Toast.Body>
                    Your,toast message here.
                </Toast.Body>
            </Toast>
            <Toast id="secondaryToast" className="toast colored-toast bg-secondary-transparent" 
              role="alert" aria-live="assertive"
                aria-atomic="true" onClose={() => setShow2(false)} show={show2} delay={3000} 
                autohide>
                <Toast.Header className="toast-header bg-secondary text-fixed-white">
                    <img className="bd-placeholder-img rounded me-2" src={toggledark} alt="..." />
                    <strong className="me-auto">azira</strong>
                </Toast.Header>
                <Toast.Body>
                    Your,toast message here.
                </Toast.Body>
            </Toast>
            <Toast id="warningToast" className="toast colored-toast bg-warning-transparent" 
             role="alert" 
               aria-live="assertive"
                onClose={() => setShow3(false)} show={show3} delay={3000} autohide
                aria-atomic="true">
                <Toast.Header className="toast-header bg-warning text-fixed-white">
                    <img className="bd-placeholder-img rounded me-2" src={toggledark} alt="..." />
                    <strong className="me-auto">azira</strong>
                </Toast.Header>
                <Toast.Body>
                    Your,toast message here.
                </Toast.Body>
            </Toast>
            <Toast id="infoToast" className="toast colored-toast bg-info-transparent" role="alert" 
              aria-live="assertive"
                onClose={() => setShow4(false)} show={show4} delay={3000} autohide
                aria-atomic="true">
                <Toast.Header className="bg-info text-fixed-white">
                    <img className="bd-placeholder-img rounded me-2" src={toggledark} alt="..." />
                    <strong className="me-auto">azira</strong>
                </Toast.Header>
                <Toast.Body>
                    Your,toast message here.
                </Toast.Body>
            </Toast>
            <Toast id="successToast" className="toast colored-toast bg-success-transparent" 
               role="alert" aria-live="assertive"
                onClose={() => setShow5(false)} show={show5} delay={3000} autohide
                aria-atomic="true">
                <Toast.Header className="bg-success text-fixed-white">
                    <img className="bd-placeholder-img rounded me-2" src={toggledark} alt="..." />
                    <strong className="me-auto">azira</strong>
                </Toast.Header>
                <Toast.Body>
                    Your,toast message here.
                </Toast.Body>
            </Toast>
            <Toast id="dangerToast" className="toast colored-toast bg-danger-transparent" 
               role="alert" aria-live="assertive"
                onClose={() => setShow6(false)} show={show6} delay={3000} autohide
                aria-atomic="true">
                <Toast.Header className="toast-header bg-danger text-fixed-white">
                    <img className="bd-placeholder-img rounded me-2" src={toggledark} alt="..." />
                    <strong className="me-auto">azira</strong>
                </Toast.Header>
                <Toast.Body className="toast-body">
                    Your,toast message here.
                </Toast.Body>
            </Toast>
        </ToastContainer>
    </Fragment>
 )
};
export default Toasts;`
export const toasts8 = `const Toasts = () => {
    const [show7, setShow7] = useState(false);
    const [show8, setShow8] = useState(false);
    const [show9, setShow9] = useState(false);
    const [show10, setShow10] = useState(false);
    const [show11, setShow11] = useState(false);
    const [show12, setShow12] = useState(false);
    return (
    <Fragment>
        <div className="btn-list">
            <Button variant='primary' type="button" 
             className="btn btn-primary me-2 btn-wave" id="solidprimaryToastBtn" 
             onClick={() => setShow7(true)}>
               Primary
            </Button>
            <Button variant='secondary' type="button" 
              className="btn btn-secondary me-2 btn-wave" id="solidsecondaryToastBtn" 
              onClick={() => setShow8(true)}>
                secondary
            </Button>
            <Button variant='warning' type="button" 
              className="btn btn-warning me-2 btn-wave" id="solidwarningToastBtn" 
              onClick={() => setShow9(true)}>
                 warning
            </Button>
            <Button variant='info' type="button" 
              className="btn btn-info me-2 btn-wave" id="solidinfoToastBtn" 
               onClick={() => setShow10(true)}>
                  info
            </Button>
            <Button variant='success' type="button" 
              className="btn btn-success me-2 btn-wave" id="solidsuccessToastBtn" 
               onClick={() => setShow11(true)}>
                 success
            </Button>
            <Button variant='danger' type="button" 
               className="btn btn-danger me-2 btn-wave" id="soliddangerToastBtn" 
                onClick={() => setShow12(true)}>
                  danger
            </Button>
        </div>
        <ToastContainer className="toast-container position-fixed top-0 end-0 p-3">
            <Toast id="solid-primaryToast" className="toast colored-toast bg-primary 
             text-fixed-white"
                onClose={() => setShow7(false)} show={show7} delay={3000} autohide>
                <Toast.Header className="toast-header bg-primary text-fixed-white">
                    <img className="bd-placeholder-img rounded me-2" src={toggledark}
                     alt="..." />
                    <strong className="me-auto">azira</strong>
                </Toast.Header>
                <Toast.Body>
                    Your,toast message here.
                </Toast.Body>
            </Toast>
            <Toast id="solid-secondaryToast" className="toast colored-toast 
              bg-secondary text-fixed-white"
                onClose={() => setShow8(false)} show={show8} delay={3000} autohide
                aria-atomic="true">
                <Toast.Header className="toast-header bg-secondary text-fixed-white">
                    <img className="bd-placeholder-img rounded me-2" src={toggledark}
                      alt="..." />
                    <strong className="me-auto">azira</strong>
                </Toast.Header>
                <Toast.Body>
                    Your,toast message here.
                </Toast.Body>
            </Toast>
            <Toast id="solid-warningToast" className="toast colored-toast bg-warning
               text-fixed-white"
                onClose={() => setShow9(false)} show={show9} delay={3000} autohide>
                <Toast.Header className="toast-header bg-warning text-fixed-white">
                    <img className="bd-placeholder-img rounded me-2" src={toggledark}
                     alt="..." />
                    <strong className="me-auto">azira</strong>
                </Toast.Header>
                <Toast.Body>
                    Your,toast message here.
                </Toast.Body>
            </Toast>
            <Toast id="solid-infoToast" className="toast colored-toast bg-info
             text-fixed-white"
                onClose={() => setShow10(false)} show={show10} delay={3000} autohide>
                <Toast.Header className="toast-header bg-info text-fixed-white">
                    <img className="bd-placeholder-img rounded me-2" src={toggledark}
                     alt="..." />
                    <strong className="me-auto">azira</strong>
                </Toast.Header>
                <Toast.Body>
                    Your,toast message here.
                </Toast.Body>
            </Toast>
            <Toast id="solid-successToast" className="toast colored-toast bg-success
              text-fixed-white"
                onClose={() => setShow11(false)} show={show11} delay={3000} autohide>
                <Toast.Header className="toast-header bg-success text-fixed-white">
                    <img className="bd-placeholder-img rounded me-2" src={toggledark}
                     alt="..." />
                    <strong className="me-auto">azira</strong>
                </Toast.Header>
                <Toast.Body>
                    Your,toast message here.
                </Toast.Body>
            </Toast>
            <Toast id="solid-dangerToast" className="toast colored-toast bg-danger
             text-fixed-white"
                onClose={() => setShow12(false)} show={show12} delay={3000} autohide>
                <Toast.Header className="toast-header bg-danger text-fixed-white">
                    <img className="bd-placeholder-img rounded me-2" src={toggledark}
                     alt="..." />
                    <strong className="me-auto">azira</strong>
                </Toast.Header>
                <Toast.Body>
                    Your,toast message here.
                </Toast.Body>
            </Toast>
        </ToastContainer>
    </Fragment>
 )
};
export default Toasts;`
export const toasts9 = `const Toasts = () => {
    const [show13, setShow13] = useState(false);
    const [show14, setShow14] = useState(false);
    const [show15, setShow15] = useState(false);
    const [show16, setShow16] = useState(false);
    const [show17, setShow17] = useState(false);
    const [show18, setShow18] = useState(false);
    const [show19, setShow19] = useState(false);
    const [show20, setShow20] = useState(false);
    const [show21, setShow21] = useState(false);
    return (
    <Fragment>
        <div className="btn-list">
            <Button variant='outline-primary' type="button" onClick={() => setShow13(true)} className="btn  me-2 btn-wave" id="topleftToastBtn">Top Left</Button>
            <Button variant='outline-primary' type="button" onClick={() => setShow14(true)} className="btn  me-2 btn-wave" id="topcenterToastBtn">Top Center</Button>
            <Button variant='outline-primary' type="button" onClick={() => setShow15(true)} className="btn  me-2 btn-wave" id="toprightToastBtn">Top Right</Button>
            <Button variant='outline-primary' type="button" onClick={() => setShow16(true)} className="btn  me-2 btn-wave" id="middleleftToastBtn">Middle Left</Button>
            <Button variant='outline-primary' type="button" onClick={() => setShow17(true)} className="btn  me-2 btn-wave" id="middlecenterToastBtn">Middle Center</Button>
            <Button variant='outline-primary' type="button" onClick={() => setShow18(true)} className="btn  me-2 btn-wave" id="middlerightToastBtn">Middle Right</Button>
            <Button variant='outline-primary' type="button" onClick={() => setShow19(true)} className="btn  me-2 btn-wave" id="bottomleftToastBtn">Bottom Left</Button>
            <Button variant='outline-primary' type="button" onClick={() => setShow20(true)} className="btn  me-2 btn-wave" id="bottomcenterToastBtn">Bottom Center</Button>
            <Button variant='outline-primary' type="button" onClick={() => setShow21(true)} className="btn  me-2 btn-wave" id="bottomrightToastBtn">Bottom Right</Button>
        </div>
        <ToastContainer className="toast-container position-fixed top-0 start-0 p-3">
            <Toast id="topleft-Toast" className="toast colored-toast bg-primary-transparent text-primary"
                onClose={() => setShow13(false)} show={show13} delay={3000} autohide>
                <Toast.Header className="toast-header bg-primary text-fixed-white">
                    <img className="bd-placeholder-img rounded me-2" src={toggledark} alt="..." />
                    <strong className="me-auto">azira</strong>
                    <button type="button" className="btn-close" data-bs-dismiss="toast"
                        aria-label="Close"></button>
                </Toast.Header>
                <Toast.Body className="toast-body">
                    Your,toast message here.
                </Toast.Body>
            </Toast>
        </ToastContainer>
        <ToastContainer className="toast-container position-fixed top-0 start-50 translate-middle-x p-3">
            <Toast id="topcenter-Toast" className="toast colored-toast bg-primary-transparent text-primary" onClose={() => setShow14(false)} show={show14} delay={3000} autohide>
                <Toast.Header className="toast-header bg-primary text-fixed-white">
                    <img className="bd-placeholder-img rounded me-2" src={toggledark} alt="..." />
                    <strong className="me-auto">azira</strong>
                </Toast.Header>
                <Toast.Body className="toast-body">
                    Your,toast message here.
                </Toast.Body>
            </Toast>
        </ToastContainer>
        <ToastContainer className="toast-container position-fixed top-0 end-0 p-3">
            <Toast id="topright-Toast" className="toast colored-toast bg-primary-transparent text-primary"
                onClose={() => setShow15(false)} show={show15} delay={3000} autohide>
                <Toast.Header className="toast-header bg-primary text-fixed-white">
                    <img className="bd-placeholder-img rounded me-2" src={toggledark} alt="..." />
                    <strong className="me-auto">azira</strong>
                </Toast.Header>
                <Toast.Body className="toast-body">
                    Your,toast message here.
                </Toast.Body>
            </Toast>
        </ToastContainer>
        <ToastContainer className="toast-container position-fixed top-50 start-0 translate-middle-y p-3">
            <Toast id="middleleft-Toast" className="toast colored-toast bg-primary-transparent text-primary"
                onClose={() => setShow16(false)} show={show16} delay={3000} autohide>
                <Toast.Header className="toast-header bg-primary text-fixed-white">
                    <img className="bd-placeholder-img rounded me-2" src={toggledark} alt="..." />
                    <strong className="me-auto">azira</strong>
                </Toast.Header>
                <Toast.Body className="toast-body">
                    Your,toast message here.
                </Toast.Body>
            </Toast>
        </ToastContainer>
        <ToastContainer className="toast-container position-fixed top-50 start-50 translate-middle">
            <Toast id="middlecenter-Toast" className="toast colored-toast bg-primary-transparent text-primary"
                onClose={() => setShow17(false)} show={show17} delay={3000} autohide>
                <Toast.Header className="toast-header bg-primary text-fixed-white">
                    <img className="bd-placeholder-img rounded me-2" src={toggledark} alt="..." />
                    <strong className="me-auto">azira</strong>
                </Toast.Header>
                <Toast.Body className="toast-body">
                    Your,toast message here.
                </Toast.Body>
            </Toast>
        </ToastContainer>
        <ToastContainer className="toast-container position-fixed top-50 end-0 translate-middle-y p-3">
            <Toast id="middleright-Toast" className="toast colored-toast bg-primary-transparent text-primary"
                onClose={() => setShow18(false)} show={show18} delay={3000} autohide>
                <Toast.Header className="toast-header bg-primary text-fixed-white">
                    <img className="bd-placeholder-img rounded me-2" src={toggledark} alt="..." />
                    <strong className="me-auto">azira</strong>
                </Toast.Header>
                <Toast.Body className="toast-body">
                    Your,toast message here.
                </Toast.Body>
            </Toast>
        </ToastContainer>
        <ToastContainer className="toast-container position-fixed bottom-0 start-0 p-3">
            <Toast id="bottomleft-Toast" className="toast colored-toast bg-primary-transparent text-primary"
                onClose={() => setShow19(false)} show={show19} delay={3000} autohide>
                <Toast.Header className="toast-header bg-primary text-fixed-white">
                    <img className="bd-placeholder-img rounded me-2" src={toggledark} alt="..." />
                    <strong className="me-auto">azira</strong>
                </Toast.Header>
                <Toast.Body className="toast-body">
                    Your,toast message here.
                </Toast.Body>
            </Toast>
        </ToastContainer>
        <ToastContainer className="toast-container position-fixed bottom-0 start-50 translate-middle-x p-3">
            <Toast id="bottomcenter-Toast" className="toast colored-toast bg-primary-transparent text-primary"
                onClose={() => setShow20(false)} show={show20} delay={3000} autohide>
                <Toast.Header className="toast-header bg-primary text-fixed-white">
                    <img className="bd-placeholder-img rounded me-2" src={toggledark} alt="..." />
                    <strong className="me-auto">azira</strong>
                </Toast.Header>
                <Toast.Body className="toast-body">
                    Your,toast message here.
                </Toast.Body>
            </Toast>
        </ToastContainer>
        <ToastContainer className="toast-container position-fixed bottom-0 end-0 p-3">
            <Toast id="bottomright-Toast" className="toast colored-toast bg-primary-transparent text-primary"
                onClose={() => setShow21(false)} show={show21} delay={3000} autohide>
                <Toast.Header className="toast-header bg-primary text-fixed-white">
                    <img className="bd-placeholder-img rounded me-2" src={toggledark} alt="..." />
                    <strong className="me-auto">azira</strong>
                </Toast.Header>
                <Toast.Body className="toast-body">
                    Your,toast message here.
                </Toast.Body>
            </Toast>
        </ToastContainer>
    </Fragment>
 )
};
export default Toasts;`
export const toasts10 = `const Toasts = () => {
    const [showK, setShowK] = useState(true);
    const toggleShowK = () => setShowK(!showK);
    return (
    <Fragment>
        <div className="bd-example bg-light bd-example-toasts d-flex p-0 px-3">
            <div aria-live="polite" aria-atomic="true"
                className="d-flex justify-content-center align-items-center w-100">
                <Toast show={showK} onClose={toggleShowK} className="toast fade show shadow-lg">
                    <Toast.Header className="text-default">
                        <img src={favicon} alt="" className="bd-placeholder-img rounded me-2" />
                        <strong className="me-auto">azira</strong>
                        <small>11 mins ago</small>
                    </Toast.Header>
                    <Toast.Body> Hello, world! This is a toast message.</Toast.Body>
                </Toast>
            </div>
        </div>
    </Fragment>
 )
};
export default Toasts;`





