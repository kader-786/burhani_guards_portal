export const table1 = `<div className="table-responsive">
    <Table className="table text-nowrap">
        <thead>
            <tr>
                <th scope="col">Name</th>
                <th scope="col">Created On</th>
                <th scope="col">Number</th>
                <th scope="col">Status</th>
            </tr>
        </thead>
        <tbody>
            {BasicTable.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">{idx.name}</th>
                    <td>{idx.createdOn}</td>
                    <td>{idx.number}</td>
                    <td><Badge bg={'outline-$#38{idx.statusColor}/} className="badge">
                     {idx.status}
                     </Badge>
                    </td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable1 = `
interface table1 {
	id: number
	name: string
	createdOn: string
    number: string
    status: string
    statusColor: string
}
export const BasicTable = [
  { id: 1, name: "Mark", createdOn: "21,Dec 2021", number: "+1234-12340", status: "Completed", 
    statusColor: "primary" },
  { id: 2, name: "Monika", createdOn: "29,April 2022", number: "+1523-12459", status: "Failed", 
    statusColor: "warning" },
  { id: 3, name: "Madina", createdOn: "30,Nov 2022", number: "+1982-16234", status: "Successful", 
    statusColor: "success" },
  { id: 4, name: "Bhamako", createdOn: "18,Mar 2022", number: "+1526-10729", status: "Pending", 
    statusColor: "secondary" },
];`
export const table2 = `<div className="table-responsive">
    <Table className="table text-nowrap table-bordered">
        <thead>
            <tr>
                <th scope="col">User</th>
                <th scope="col">Status</th>
                <th scope="col">Email</th>
                <th scope="col">Action</th>
            </tr>
        </thead>
        <tbody>
            {Table1data.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row" key={Math.random()}>
                        <div className="d-flex align-items-center">
                            <span className={'avatar avatar-xs me-2 $#38{idx.class1} 
                             avatar-rounded'}>
                                <img src={idx.src} alt="img" />
                            </span>{idx.name}
                        </div>
                    </th>
                    <td><Badge bg={idx.color} className={'badge $#38{idx.class}'}>
                      {idx.text}</Badge>
                    </td>
                    <td>{idx.mail}</td>
                    <td>
                        <div className="hstack gap-2 flex-wrap">
                            <Link to="#" className="text-info fs-14 lh-1"><i
                                className="ri-edit-line"></i></Link>
                            <Link to="#" className="text-danger fs-14 lh-1"><i
                                className="ri-delete-bin-5-line"></i></Link>
                        </div>
                    </td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable2 = `
interface table2 {
	id: number
	src: string
	name: string
    mail: string
    color: string
    class: string
    class1: string
    text: string
}
export const Table1data = [
  { id: 1, src: "../../../../assets/images/faces/13.jpg", name: 'Sukuro Kim',
    mail: 'kimosukuro@gmail.com', color: 'success-transparent ', class: '', 
    text: 'Active', class1: 'online' },
  { id: 2, src: "../../../../assets/images/faces/6.jpg", name: 'Hasimna', 
   mail: 'hasimna2132@gmail.com', color: 'light', class: 'text-default', 
   text: 'Inactive', class1: 'offline' },
  { id: 3, src: "../../../../assets/images/faces/15.jpg", name: 'Azimo Khan', 
   mail: 'azimokhan421@gmail.com', color: 'success-transparent ', class: '', 
   text: 'Active', class1: 'online' },
  { id: 4, src: "../../../../assets/images/faces/5.jpg", name: 'Samantha Julia', 
   mail: 'julianasams143@gmail.com', color: 'success-transparent ', class: '',
   text: 'Active', class1: 'online' }
];`
export const table3 = ` <div className="table-responsive">
    <Table bordered className="table text-nowrap  border-primary">
        <thead>
            <tr>
                <th scope="col">Order</th>
                <th scope="col">Date</th>
                <th scope="col">Customer</th>
                <th scope="col">Action</th>
            </tr>
        </thead>
        <tbody>
            {Table2data.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">
                        {idx.order}
                    </th>
                    <td>
                        <span className="badge bg-light 
                        text-dark">{idx.date}</span>
                    </td>
                    <td>
                        <div className="d-flex 
                         align-items-center">
                            <span className="avatar 
                             avatar-xs me-2 online 
                             avatar-rounded">
                                <img src={idx.src}
                                  alt="img" />
                            </span>{idx.name}
                        </div>
                    </td>
                    <td><span className="badge 
                     bg-primary-transparent">
                      Booked</span>
                    </td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable3 = `
interface table2 {
    id: number
    src: string
    order: string
    date: string
    name: string
}
export const Table2data = [
  { id: 1, src: "../../../../assets/images/faces/3.jpg",  
    date: '26-04-2022', name: 'Mayor Kelly',order: '#0007', },
  { id: 2, src: "../../../../assets/images/faces/6.jpg",,
     date: '15-02-2022', name: 'Wicky Kross', order: '#0008' },
  { id: 3, src: "../../../../assets/images/faces/1.jpg", , 
    date: '23-05-2022', name: 'Julia Cam',order: '#0009' }
];`
export const table4 = `<div className="table-responsive">
    <Table bordered className="table text-nowrap 
     border-success">
        <thead>
            <tr>
                <th scope="col">Order</th>
                <th scope="col">Date</th>
                <th scope="col">Customer</th>
                <th scope="col">Status</th>
            </tr>
        </thead>
        <tbody>
            {Table3data.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">
                        {idx.order}
                    </th>
                    <td>
                        <span className="badge bg-light 
                         text-dark">{idx.date}</span>
                    </td>
                    <td>
                        <div className="d-flex 
                         align-items-center">
                            <span className="avatar 
                             avatar-xs me-2 online 
                              avatar-rounded">
                                <img src={idx.src} 
                                 alt="img" />
                            </span>{idx.name}
                        </div>
                    </td>
                    <td><span className="badge 
                      bg-success-transparent">
                      Delivered</span>
                    </td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable4 = `
interface table2 {
    id: number
    src: string
    order: string
    date: string
    name: string
}
export const Table3data = [
  { id: 1, src: "../../../../assets/images/faces/10.jpg", 
    order: '#0011', date: '07-01-2022', name: 'Helsenky', },
  { id: 2, src: "../../../../assets/images/faces/14.jpg", 
    order: '#0012', date: '18-05-2022', name: 'Brodus', },
  { id: 3, src: "../../../../assets/images/faces/12.jpg", 
    order: '#0013', date: '19-03-2022', name: 'Chikka Alen', }
];`
export const table5 = `<div className="table-responsive">
    <Table bordered className="table text-nowrap 
     table-bordered border-warning">
        <thead>
            <tr>
                <th scope="col">Order</th>
                <th scope="col">Date</th>
                <th scope="col">Customer</th>
                <th scope="col">Action</th>
            </tr>
        </thead>
        <tbody>
            {Table4data.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">
                        {idx.order}
                    </th>
                    <td>
                        <span className="badge bg-light 
                         text-dark">{idx.date}</span>
                    </td>
                    <td>
                        <div className="d-flex 
                         align-items-center">
                            <span className="avatar 
                             avatar-xs me-2 online 
                             avatar-rounded">
                                <img src={idx.src}
                                  alt="img" />
                            </span>{idx.name}
                        </div>
                    </td>
                    <td>
                      <span className="badge
                       bg-warning-transparent">
                         Accepted
                      </span>
                    </td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable5 = `
interface table5 {
    id: number
    src: string
    order: string
    name: string
}
export const Table4data = [
  { id: 1, src: "../../../../assets/images/faces/13.jpg", 
   order: '#0014', date: '21-02-2022', name: 'Sukuro Kim', },
  { id: 2, src: "../../../../assets/images/faces/11.jpg", 
   order: '#0018', date: '26-03-2022', name: 'Alex Carey', },
  { id: 3, src: "../../../../assets/images/faces/2.jpg", 
   order: '#0020', date: '14-03-2022', name: 'Pamila Anderson', }
];`
export const table6 = ` <div className="table-responsive">
    <Table borderless className="text-nowrap">
        <thead>
            <tr>
                <th scope="col">User Name</th>
                <th scope="col">Transaction Id</th>
                <th scope="col">Created</th>
                <th scope="col">Status</th>
            </tr>
        </thead>
        <tbody>
            {TableWithoutBorders.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">{idx.name}</th>
                    <td>{idx.transactionId}</td>
                    <td>{idx.created}</td>
                    <td>
                      <span className={'badge bg-$#38{idx.statusColor}'}>
                         {idx.status}
                      </span>
                    </td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable6 = `
interface table6 {
    id: number
    transactionId: string
    created: string
    status: string
    statusColor: string
    name: string
}
export const TableWithoutBorders = [
  { id: 1, name: "Harshrath", transactionId: "#5182-3467", created: "24 May 2022",
    status: "Fixed", statusColor: "primary" },
  { id: 2, name: "Zozo Hadid", transactionId: "	#5182-3412", created: "02 July 2022",
    status: "In Progress", statusColor: "warning" },
  { id: 3, name: "Martiana", transactionId: "#5182-3423", created: "15 April 2022",
    status: "Completed", statusColor: "success" },
  { id: 4, name: "Alex Carey", transactionId: "#5182-3456", created: "17 March 2022",
    status: "Pending", statusColor: "danger" },
];`
export const table7 = `<div className="table-responsive">
    <Table className="table text-nowrap">
        <thead>
            <tr>
                <th scope="col">Product</th>
                <th scope="col">Seller</th>
                <th scope="col">Sale Percentage</th>
                <th scope="col">Quantity Sold</th>
            </tr>
        </thead>
        <tbody className="table-group-divider">
            {TableGroupDivideres.map(idx => (
                <tr key={Math.random()}>
                    <th scope="row">{idx.product}</th>
                    <td>{idx.seller}</td>
                    <td><Link to="#" className={'text-$#38{idx.color}'}>{idx.quantitySold}<i
                        className={'ri-arrow-$#38{idx.arrow}-fill ms-1'}></i></Link></td>
                    <td>250/1786</td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable7 = `
interface table7 {
    id: number
    seller: string
    salePercentage: string
    arrow: string
    color: string
    quantitySold: string
}
export const TableGroupDivideres = [
  { id: 1, product: "Smart Watch", seller: "Slowtrack.inc", salePercentage: "24.23%", 
   arrow: 'up', color: "success", quantitySold: "250/1786" },
  { id: 2, product: "White Sneakers", seller: "	American & Co.inc", salePercentage: "12.45%", 
   arrow: 'down', color: "danger", quantitySold: "123/985" },
  { id: 3, product: "Baseball Bat", seller: "Sports Company", salePercentage: "06.64%", 
   arrow: 'up', color: "success", quantitySold: "124/232" },
  { id: 4, product: "Black Hoodie", seller: "Renonds Fabrics", salePercentage: "14.42%", 
   arrow: 'up', color: "success", quantitySold: "192/2456" },
];`
export const table8 = `<div className="table-responsive">
    <Table striped className="table text-nowrap table-striped">
        <thead>
            <tr>
                <th scope="col">ID</th>
                <th scope="col">Date</th>
                <th scope="col">Customer</th>
                <th scope="col">Action</th>
            </tr>
        </thead>
        <tbody>
            {Table5data.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">{idx.order}</th>
                    <td>{idx.date}</td>
                    <td>{idx.name}</td>
                    <td>
                        <Button variant='success' className="btn btn-sm btn-wave">
                            <i className="ri-download-2-line align-middle me-2 d-inline-block">
                            </i>Download
                        </Button>
                    </td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable8 = `
interface table8 {
    id: number
    src: string
    order: string
    date: string
    name: string
}
export const Table5data = [
  { id: 1, src: "../../../../assets/images/faces/13.jpg", order: '2022R-01',
   date: '27-010-2022', name: 'Moracco' },
  { id: 2, src: "../../../../assets/images/faces/11.jpg", order: '2022R-02',
    date: '28-10-2022', name: 'Thornton' },
  { id: 3, src: "../../../../assets/images/faces/2.jpg", order: '2022R-03',
    date: '22-10-2022', name: 'Larry Bird' },
  { id: 4, src: "../../../../assets/images/faces/2.jpg", order: '2022R-04',
    date: '29-09-2022', name: 'Erica Sean' }
];`
export const table9 = `<div className="table-responsive">
    <Table striped="columns" className="table text-nowrap">
        <thead>
            <tr>
                <th scope="col">ID</th>
                <th scope="col">Date</th>
                <th scope="col">Customer</th>
                <th scope="col">Action</th>
            </tr>
        </thead>
        <tbody>
            {Table5data.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">{idx.order}</th>
                    <td>{idx.date}</td>
                    <td>{idx.name}</td>
                    <td>
                        <Button variant='' className="btn btn-sm btn-danger btn-wave">
                            <i className="ri-delete-bin-line align-middle me-2 d-inline-block">
                            </i>Delete
                        </Button>
                    </td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable9 = `
interface table9 {
    id: number
    src: string
    order: string
    date: string
    name: string
}
export const Table5data = [
  { id: 1,  order: '2022R-01', date: '27-010-2022', name: 'Moracco' },
  { id: 2,  order: '2022R-02', date: '28-10-2022', name: 'Thornton' },
  { id: 3, order: '2022R-03', date: '22-10-2022', name: 'Larry Bird' },
  { id: 4, order: '2022R-04', date: '29-09-2022', name: 'Erica Sean' }
];`
export const table10 = `<div className="table-responsive">
    <Table variant='primary' className="table text-nowrap">
        <thead>
            <tr>
                <th scope="col">#</th>
                <th scope="col">First</th>
                <th scope="col">Last</th>
                <th scope="col">Handle</th>
            </tr>
        </thead>
        <tbody>
            {Table6data.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">{idx.id}</th>
                    <td>{idx.text1}</td>
                    <td>{idx.text2}</td>
                    <td>{idx.text3}</td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable10 = `
interface table10 {
    id: number
    Mark: string
    text2: string
    text3: string
}
export const Table6data = [
  { id: 1, text1: 'Mark', text2: 'Otto', text3: '@mdo' },
  { id: 2, text1: 'Jacob', text2: 'Thornton', text3: '@fat' },
  { id: 3, text1: 'Larry the Bird', text2: 'Thornton', 
   text3: '@twitter' }
];`
export const table11 = `<div className="table-responsive">
    <Table variant='secondary' className="table text-nowrap">
        <thead>
            <tr>
                <th scope="col">#</th>
                <th scope="col">First</th>
                <th scope="col">Last</th>
                <th scope="col">Handle</th>
            </tr>
        </thead>
        <tbody>
            {Table6data.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">{idx.id}</th>
                    <td>{idx.text1}</td>
                    <td>{idx.text2}</td>
                    <td>{idx.text3}</td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable11 = `
interface table10 {
    id: number
    text1: string
    text2: string
    text3: string
}
export const Table6data = [
  { id: 1, text1: 'Mark', text2: 'Otto', text3: '@mdo' },
  { id: 2, text1: 'Jacob', text2: 'Thornton', text3: '@fat' },
  { id: 3, text1: 'Larry the Bird', text2: 'Thornton', 
    text3: '@twitter' }
];`
export const table12 = ` <div className="table-responsive">
    <Table variant='warning' className="table text-nowrap">
        <thead>
            <tr>
                <th scope="col">#</th>
                <th scope="col">First</th>
                <th scope="col">Last</th>
                <th scope="col">Handle</th>
            </tr>
        </thead>
        <tbody>
            {Table6data.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">{idx.id}</th>
                    <td>{idx.text1}</td>
                    <td>{idx.text2}</td>
                    <td>{idx.text3}</td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable12 = `
interface table12 {
    id: number
    text1: string
    text2: string
    text3: string
}
export const Table6data = [
  { id: 1, text1: 'Mark', text2: 'Otto', text3: '@mdo' },
  { id: 2, text1: 'Jacob', text2: 'Thornton', text3: '@fat' },
  { id: 3, text1: 'Larry the Bird', text2: 'Thornton', 
    text3: '@twitter' }
];`
export const table13 = `<div className="table-responsive">
    <Table variant='danger' className="table text-nowrap 
     table-danger">
        <thead>
            <tr>
                <th scope="col">#</th>
                <th scope="col">First</th>
                <th scope="col">Last</th>
                <th scope="col">Handle</th>
            </tr>
        </thead>
        <tbody>
            {Table6data.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">{idx.id}</th>
                    <td>{idx.text1}</td>
                    <td>{idx.text2}</td>
                    <td>{idx.text3}</td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable13 = `
interface table13 {
    id: number
    text1: string
    text2: string
    text3: string
}
export const Table6data = [
  { id: 1, text1: 'Mark', text2: 'Otto', text3: '@mdo' },
  { id: 2, text1: 'Jacob', text2: 'Thornton', text3: '@fat' },
  { id: 3, text1: 'Larry the Bird', text2: 'Thornton', 
    text3: '@twitter' }
];`
export const table14 = ` <div className="table-responsive">
    <Table variant='dark' className="table text-nowrap">
        <thead>
            <tr>
                <th scope="col">#</th>
                <th scope="col">First</th>
                <th scope="col">Last</th>
                <th scope="col">Handle</th>
            </tr>
        </thead>
        <tbody>
            {Table6data.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">{idx.id}</th>
                    <td>{idx.text1}</td>
                    <td>{idx.text2}</td>
                    <td>{idx.text3}</td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable14 = `
interface table14 {
    id: number
    text1: string
    text2: string
    text3: string
}
export const Table6data = [
  { id: 1, text1: 'Mark', text2: 'Otto', text3: '@mdo' },
  { id: 2, text1: 'Jacob', text2: 'Thornton', text3: '@fat' },
  { id: 3, text1: 'Larry the Bird', text2: 'Thornton', 
    text3: '@twitter' }
];`
export const table15 = `<div className="table-responsive">
    <table striped variant='success' className="table 
     text-nowrap table-success table-striped">
        <thead>
            <tr>
                <th scope="col">#</th>
                <th scope="col">First</th>
                <th scope="col">Last</th>
                <th scope="col">Handle</th>
            </tr>
        </thead>
        <tbody>
            {Table6data.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">{idx.id}</th>
                    <td>{idx.text1}</td>
                    <td>{idx.text2}</td>
                    <td>{idx.text3}</td>
                </tr>
            ))}
        </tbody>
    </table>
</div>`
export const datatable15 = `
interface table15 {
    id: number
    text1: string
    text2: string
    text3: string
}
export const Table6data = [
  { id: 1, text1: 'Mark', text2: 'Otto', text3: '@mdo' },
  { id: 2, text1: 'Jacob', text2: 'Thornton', text3: '@fat' },
  { id: 3, text1: 'Larry the Bird', text2: 'Thornton', 
    text3: '@twitter' }
];`
export const table16 = `<div className="table-responsive">
    <table hover className="text-nowrap">
        <thead>
            <tr>
                <th scope="col">Product Manager</th>
                <th scope="col">Category</th>
                <th scope="col">Team</th>
                <th scope="col">Status</th>
            </tr>
        </thead>
        <tbody>
            {HoverableRows.map(idx => (
                <tr key={Math.random()}>
                    <td>
                        <div className="d-flex align-items-center">
                            <div className="avatar avatar-sm me-2 avatar-rounded">
                                <img src={idx.src} alt="img" />
                            </div>
                            <div>
                                <div className="lh-1">
                                    <span>{idx.name}</span>
                                </div>
                                <div className="lh-1">
                                    <span
                                        className="fs-11 text-muted">{idx.email}</span>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td>
                      <span className={'badge bg-$#38{idx.categoryColor}-transparent'}>
                        {idx.category} 
                      </span>
                    </td>
                    <td>
                        <div className="avatar-list-stacked">
                            {idx.teem.map((idx) => (
                                <span className="avatar avatar-rounded" key={Math.random()}>
                                    <img src={idx.img1} alt='img' />
                                </span>
                            ))}
                            <Link className="avatar avatar-sm bg-primary text-fixed-white 
                              avatar-rounded">
                            {idx.teem.length > 5 ? <span className="avatar bg-primary 
                             text-fixed-white avatar-rounded">
                             +{idx.teem.length - 5} </span> : ''}
                            </Link>
                        </div>
                    </td>
                    <td>
                        <ProgressBar variant='primary' className="progress-xs" now={idx.status} />
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
</div>`
export const datatable16 = `export const HoverableRows = [
  {
    id: 1, src: face1, name: "Joanna Smith", email: "joannasmith14@gmail.com", 
    category: "Fashion", categoryColor: "primary",
    teem: [{ img1: face1 }, { img1: face2 }, { img1: face14 }, { img1: face13 }, { img1: face14 },
    { img1: face11 }, { img1: face1 }, { img1: face1 }, { img1: face1 }, { img1: face1 },],
    status: 40, statusColor: "primary"
  },
  {
    id: 2, src: face2, name: "Kara Kova", email: "milesakara@gmail.com",
     category: "Clothing", categoryColor: "warning",
    teem: [{ img1: face1 }, { img1: face2 }, { img1: face14 }, { img1: face13 }, { img1: face14 },
     { img1: face11 }, { img1: face1 }],
    status: 30, statusColor: "primary"
  },
  {
    id: 3, src: face3, name: "Donald Trimb", email: "donaldo21@gmail.com",
    category: "Electronics", categoryColor: "danger",
    teem: [{ img1: face1 }, { img1: face2 }, { img1: face14 }, { img1: face13 }, { img1: face14 },
     { img1: face11 },],
    status: 10, statusColor: "primary"
  },
  {
    id: 4, src: face5, name: "Justin Gaethje", email: "justingae@gmail.com",
    category: "Sports", categoryColor: "danger",
    teem: [{ img1: face1 }, { img1: face2 }, { img1: face14 }, { img1: face1 },],
    status: 80, statusColor: "primary"
  },
];`
export const table17 = ` <div className="table-responsive">
    <Table striped hover className="table text-nowrap">
        <thead>
            <tr>
                <th scope="col">Invoice</th>
                <th scope="col">Customer</th>
                <th scope="col">Status</th>
                <th scope="col">Date</th>
            </tr>
        </thead>
        <tbody>
            {Table7data.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">{idx.text1}</th>
                    <td>
                        <div className="d-flex align-items-center">
                            <div className="avatar avatar-sm me-2 avatar-rounded">
                                <img src={idx.src} alt="img" />
                            </div>
                            <div>
                                <div className="lh-1">
                                    <span>{idx.name}</span>
                                </div>
                                <div className="lh-1">
                                    <span
                                        className="fs-11 text-muted">{idx.mail}</span>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td><Badge bg={idx.color} className={'badge $#38{idx.class}'}><i
                        className={'ri-$#38{idx.icon} align-middle me-1'}></i>{idx.text2}
                       </Badge>
                    </td>
                    <td>{idx.date}</td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable17 = `
interface table17 {
    id: number
    src: string
    name: string
    mail: string
    date: string
    text1: string
    text2: string
    color: string
    class: string
    icon: string
}
export const Table7data = [
  { id: 1, src: "../../../../assets/images/faces/15.jpg", name: 'Mark Cruise', 
    mail: 'markcruise24@gmail.com', date: 'Jul 26,2022', text1: 'IN-2032', 
    text2: 'Paid', color: 'success-transparent', class: '', icon: 'check-fill'
  },
  { id: 2, src: "../../../../assets/images/faces/12.jpg", name: 'Charanjeep', 
    mail: 'charanjeep@gmail.in', date: 'Mar 14,2022', text1: 'IN-2022', 
    text2: 'Paid', color: 'success-transparent', class: '', icon: 'check-fill'
  },
  { id: 3, src: "../../../../assets/images/faces/5.jpg", name: 'Samantha Julie', 
    mail: 'julie453@gmail.com', date: 'Feb 1,2022', text1: 'IN-2014', 
    text2: 'Cancelled', color: 'danger-transparent', class: '', icon: 'close-fill'
  },
  { id: 4, src: "../../../../assets/images/faces/11.jpg", name: 'Simon Cohen', 
    mail: 'simon@gmail.com', date: 'Apr 24,2022', text1: 'IN-2036', 
    text2: 'Refunded', color: 'light', class: 'text-default', icon: 'reply-line' 
  }
];`
export const table18 = `<div className="table-responsive">
    <Table className="table text-nowrap">
        <thead className="table-primary">
            <tr>
                <th scope="col">User Name</th>
                <th scope="col">Transaction Id</th>
                <th scope="col">Created</th>
                <th scope="col">Status</th>
            </tr>
        </thead>
        <tbody>
            {Table8data.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">{idx.name}</th>
                    <td>{idx.text}</td>
                    <td>{idx.date}</td>
                    <td>
                        <div className="hstack gap-2 fs-15">
                            <Link to="#"
                                className="btn btn-icon btn-sm btn-success-transparent 
                                rounded-pill"><iclassName="ri-download-2-line"></iclassName=></Link>
                            <Link to="#"
                                className="btn btn-icon btn-sm btn-info-transparent rounded-pill"><i
                                    className="ri-edit-line"></i></Link>
                            <Link to="#"
                                className="btn btn-icon btn-sm btn-danger-transparent rounded-pill">
                                <i className="ri-delete-bin-line"></i></Link>
                        </div>
                    </td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable18 = `
interface table18 {
    id: number
    name: string
    date: string
    text: string
}
export const Table8data = [
  { id: 1, name: 'Harshrath', date: '24 May 2022', text: '	#5182-3467' },
  { id: 2, name: 'Zozo Hadid', date: '02 July 2022', text: '#5182-3412' },
  { id: 3, name: 'Martiana', date: '15 April 2022', text: '#5182-3423' },
  { id: 4, name: 'Alex Carey', date: '17 March 2022', text: '#5182-3456' }
];`
export const table19 = `<div className="table-responsive">
    <Table className="table text-nowrap">
        <thead className="table-warning">
            <tr>
                <th scope="col">User Name</th>
                <th scope="col">Transaction Id</th>
                <th scope="col">Created</th>
                <th scope="col">Status</th>
            </tr>
        </thead>
        <tbody>
            {Table9data.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">{idx.name}</th>
                    <td>{idx.text}</td>
                    <td>{idx.date}</td>
                    <td>
                        <Button variant={idx.color} className="btn btn-sm">{idx.btn}</Button>
                    </td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable19 = `
interface table19 {
    id: number
    name: string
    date: string
    text: string
    btn: string
    color: string
}
export const Table9data = [
  { id: 1, name: 'Harshrath', date: '24 May 2022', text: '	#5182-3467', btn: 'Pending', 
    color: 'primary-light' },
  { id: 2, name: 'Zozo Hadid', date: '02 July 2022', text: '#5182-3412', btn: 'Pending', 
    color: 'primary-light' },
  { id: 3, name: 'Martiana', date: '15 April 2022', text: '#5182-3423', btn: 'Rejected', 
    color: 'danger-light' },
  { id: 4, name: 'Alex Carey', date: '17 March 2022', text: '#5182-3456', btn: 'Processed', 
    color: 'success-light' }
];`
export const table20 = `<div className="table-responsive">
    <Table className="table text-nowrap">
        <thead className="table-success">
            <tr>
                <th scope="col">User Name</th>
                <th scope="col">Transaction Id</th>
                <th scope="col">Created</th>
                <th scope="col">Status</th>
            </tr>
        </thead>
        <tbody>
            {Table9data.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">{idx.name}</th>
                    <td>{idx.text}</td>
                    <td>{idx.date}</td>
                    <td>
                        <Button variant={idx.color} className="btn btn-sm">{idx.btn}</Button>
                    </td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable20 = `
interface table20 {
    id: number
    name: string
    date: string
    text: string
    btn: string
    color: string
}
export const Table9data = [
  { id: 1, name: 'Harshrath', date: '24 May 2022', text: '	#5182-3467', btn: 'Pending', 
    color: 'primary-light' },
  { id: 2, name: 'Zozo Hadid', date: '02 July 2022', text: '#5182-3412', btn: 'Pending', 
    color: 'primary-light' },
  { id: 3, name: 'Martiana', date: '15 April 2022', text: '#5182-3423', btn: 'Rejected', 
    color: 'danger-light' },
  { id: 4, name: 'Alex Carey', date: '17 March 2022', text: '#5182-3456', btn: 'Processed', 
    color: 'success-light' }
];`
export const table21 = `<div className="table-responsive">
    <Table className="table text-nowrap">
        <thead className="table-info">
            <tr>
                <th scope="col">User Name</th>
                <th scope="col">Transaction Id</th>
                <th scope="col">Created</th>
                <th scope="col">Status</th>
            </tr>
        </thead>
        <tbody>
            {Table9data.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">{idx.name}</th>
                    <td>{idx.text}</td>
                    <td>{idx.date}</td>
                    <td>
                        <Button variant={idx.color} className="btn btn-sm">{idx.btn}</Button>
                    </td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable21 = `
interface table21 {
    id: number
    name: string
    date: string
    text: string
    btn: string
    color: string
}
export const Table9data = [
  { id: 1, name: 'Harshrath', date: '24 May 2022', text: '	#5182-3467', btn: 'Pending', 
    color: 'primary-light' },
  { id: 2, name: 'Zozo Hadid', date: '02 July 2022', text: '#5182-3412', btn: 'Pending', 
    color: 'primary-light' },
  { id: 3, name: 'Martiana', date: '15 April 2022', text: '#5182-3423', btn: 'Rejected', 
    color: 'danger-light' },
  { id: 4, name: 'Alex Carey', date: '17 March 2022', text: '#5182-3456', btn: 'Processed', 
    color: 'success-light' }
];`
export const table22 = `<div className="table-responsive">
    <Table className="table text-nowrap">
        <thead className="table-secondary">
            <tr>
                <th scope="col">User Name</th>
                <th scope="col">Transaction Id</th>
                <th scope="col">Created</th>
                <th scope="col">Status</th>
            </tr>
        </thead>
        <tbody>
            {Table9data.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">{idx.name}</th>
                    <td>{idx.text}</td>
                    <td>{idx.date}</td>
                    <td>
                        <Button variant={idx.color} className="btn btn-sm">{idx.btn}</Button>
                    </td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable22 = `
interface table22 {
    id: number
    name: string
    date: string
    text: string
    btn: string
    color: string
}
export const Table9data = [
  { id: 1, name: 'Harshrath', date: '24 May 2022', text: '	#5182-3467', btn: 'Pending', 
    color: 'primary-light' },
  { id: 2, name: 'Zozo Hadid', date: '02 July 2022', text: '#5182-3412', btn: 'Pending', 
    color: 'primary-light' },
  { id: 3, name: 'Martiana', date: '15 April 2022', text: '#5182-3423', btn: 'Rejected', 
    color: 'danger-light' },
  { id: 4, name: 'Alex Carey', date: '17 March 2022', text: '#5182-3456', btn: 'Processed', 
    color: 'success-light' }
];`
export const table23 = `<div className="table-responsive">
    <Table className="table text-nowrap">
        <thead className="table-danger">
            <tr>
                <th scope="col">User Name</th>
                <th scope="col">Transaction Id</th>
                <th scope="col">Created</th>
                <th scope="col">Status</th>
            </tr>
        </thead>
        <tbody>
            {Table9data.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">{idx.name}</th>
                    <td>{idx.text}</td>
                    <td>{idx.date}</td>
                    <td>
                        <Button variant={idx.color} className="btn btn-sm">{idx.btn}</Button>
                    </td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable23 = `
interface table23 {
    id: number
    name: string
    date: string
    text: string
    btn: string
    color: string
}
export const Table9data = [
  { id: 1, name: 'Harshrath', date: '24 May 2022', text: '	#5182-3467', btn: 'Pending', 
    color: 'primary-light' },
  { id: 2, name: 'Zozo Hadid', date: '02 July 2022', text: '#5182-3412', btn: 'Pending', 
    color: 'primary-light' },
  { id: 3, name: 'Martiana', date: '15 April 2022', text: '#5182-3423', btn: 'Rejected', 
    color: 'danger-light' },
  { id: 4, name: 'Alex Carey', date: '17 March 2022', text: '#5182-3456', btn: 'Processed', 
    color: 'success-light' }
];`
export const table24 = `<div className="table-responsive">
    <Table className="table text-nowrap">
        <thead className="table-danger">
            <tr>
                <th scope="col">User Name</th>
                <th scope="col">Transaction Id</th>
                <th scope="col">Created</th>
                <th scope="col">Status</th>
            </tr>
        </thead>
        <tbody>
            {Table9data.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">{idx.name}</th>
                    <td>{idx.text}</td>
                    <td>{idx.date}</td>
                    <td>
                        <Button variant={idx.color}
                         className="btn btn-sm">{idx.btn}
                        </Button>
                    </td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable24 = `
interface table24 {
    id: number
    date: string
    text1: string
    text2: string
    text3: string
    text4: string
}
export const Table10data = [
  { id: 1, text1: '01', text2: 'Manchester', text3: '232',
     text4: '42%' },
  { id: 2, text1: '02', text2: 'Barcelona', text3: '175',
    text4: '58%' },
  { id: 3, text1: '03', text2: 'Portugal', text3: '126',
    text4: '32%' }
];`
export const table25 = `<div className="table-responsive">
    <Table className="table text-nowrap">
        <caption>Top 3 Countries</caption>
        <thead>
            <tr>
                <th scope="col">S.No</th>
                <th scope="col">Country</th>
                <th scope="col">Medals Won</th>
                <th scope="col">No Of Athletes</th>
            </tr>
        </thead>
        <tbody>
            {TableWithCaption.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">{idx.id}</th>
                    <td>{idx.country}</td>
                    <td>{idx.medalsWon}
                       <i className="ri-medal-line mx-2"></i>
                    </td>
                    <td>{idx.noOfAthletes}</td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable25 = `
interface table25 {
    id: number
    country: string
    medalsWon: string
    noOfAthletes: string
}
export const TableWithCaption = [
  { id: 1, country: "United States", medalsWon: "2012", 
    noOfAthletes: "1823" },
  { id: 2, country: "United Kingdom", medalsWon: "1012", 
    noOfAthletes: "	992" },
  { id: 3, country: "Germany", medalsWon: "914", 
    noOfAthletes: "875" },
];`
export const table26 = `<div className="table-responsive">
    <Table className="table text-nowrap caption-top">
        <caption>Top IT Companies</caption>
        <thead>
            <tr>
                <th scope="col">S.No</th>
                <th scope="col">Name</th>
                <th scope="col">Revenue</th>
                <th scope="col">Country</th>
            </tr>
        </thead>
        <tbody>
            {TableWithTopCaption.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">{idx.id}</th>
                    <td>{idx.name}</td>
                    <td>{idx.revenue}</td>
                    <td>{idx.country}</td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable26 = `
interface table26 {
    id: number
    name: string
    revenue: string
    country: string
}
export const TableWithTopCaption = [
  { id: 1, name: "Microsoft", revenue: "$170 billion", 
    country: "United States" },
  { id: 2, name: "HP", revenue: "$70 billion",
     country: "United States" },
  { id: 3, name: "IBM", revenue: "$60 billion", 
   country: "United States" },
];`
export const table27 = `<div className="table-responsive">
    <Table className="table text-nowrap">
        <thead>
            <tr>
                <th scope="col">Name</th>
                <th scope="col">Created On</th>
                <th scope="col">Number</th>
                <th scope="col">Status</th>
            </tr>
        </thead>
        <tbody>
            {ActiveTables.map((idx) => (
                <tr className="table-active" key={Math.random()}>
                    <th scope="row">{idx.name}</th>
                    <td>{idx.createdOn}</td>
                    <td>{idx.number}</td>
                    <td><span className={'badge bg-&#36;{idx.statusColor}'}>{idx.status}</span></td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable27 = `
interface table27 {
    id: number
    name: string
    number: string
    status: string
    statusColor: string
}
export const ActiveTables = [
  { id: 1, name: "Mark", createdOn: "21,Dec 2021", number: "+1234-12340", 
    status: "Completed", statusColor: "primary" },
  { id: 2, name: "Monika", createdOn: "29,April 2022", number: "+1523-12459", 
    status: "Failed", statusColor: "warning" },
  { id: 3, name: "Madina", createdOn: "30,Nov 2022", number: "+1982-16234", 
    status: "Successful", statusColor: "success" },
  { id: 4, name: "Bhamako", createdOn: "18,Mar 2022", number: "+1526-10729", 
    status: "Pending", statusColor: "secondary" },
];`
export const table28 = `<div className="table-responsive">
    <Table size="sm" className="table text-nowrap">
        <thead>
            <tr>
                <th scope="col">Invoice</th>
                <th scope="col">Created Date</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
            </tr>
        </thead>
        <tbody>
            {Table11data.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">
                        <div className="form-check">
                            <Form.Check id={idx.id} className="" type="checkbox" value="" />
                            <Form.Label className="" htmlFor="checkebox-sm">
                                {idx.name}
                            </Form.Label>
                        </div>
                    </th>
                    <td>{idx.date}</td>
                    <td><Badge bg={idx.class} className="badge">{idx.text}</Badge></td>
                    <td>
                        <div className="hstack gap-2 fs-15">
                            <Link to="#" className="btn btn-icon btn-sm btn-light">
                              <i className="ri-download-2-line"></i>
                            </Link>
                            <Link to="#" className="btn btn-icon btn-sm btn-light">
                                <i className="ri-edit-line"></i>
                            </Link>
                        </div>
                    </td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable28 = `
interface table28 {
    id: number
    name: string
    date: string
    text: string
    class: string
}
export const Table11data = [
  { id: '1', name: 'Zelensky', date: '25-Apr-2021', text: 'Paid', class: 'success-transparent' },
  { id: '2', name: 'Kim Jong', date: '29-April-2022', text: 'Pending', class: 'danger-transparent' },
  { id: '3', name: 'Obana', date: '30-Nov-2022', text: 'Paid', class: 'success-transparent' },
  { id: '4', name: 'Sean Paul', date: '01-Jan-2022', text: 'Paid', class: 'success-transparent' },
  { id: '5', name: 'Karizma', date: '14-Feb-2022', text: 'Pending', class: 'danger-transparent' }
];`
export const table29 = `<div className="table-responsive">
    <Table className="table text-nowrap">
        <thead>
            <tr>
                <th scope="col">Color</th>
                <th scope="col">Client</th>
                <th scope="col">State</th>
                <th scope="col">Quantity</th>
                <th scope="col">Total Price</th>
            </tr>
        </thead>
        <tbody>
            {Table12data.map((idx) => (
                <tr key={Math.random()} className={idx.class1}>
                    <th scope="row">{idx.text}</th>
                    <td>{idx.name}</td>
                    <td>
                      <Badge bg={idx.color} className={'badge $#38{idx.class2}'}>
                         Processed
                      </Badge>
                    </td>
                    <td>{idx.quantity}</td>
                    <td>{idx.price}</td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable29 = `
interface table29 {
    id: number
    text: string
    color: string
    quantity: string
    price: string
    class1: string
    class2: string
    name: string
}
export const Table12data = [
  { id: 1, text: 'Default', color: 'primary-transparent', quantity: '22', price: '$2,012',
    class1: '', class2: '', name: 'Rita Book' },
  { id: 2, text: 'Primary', color: 'primary', quantity: '22', price: '$4,254',
    class1: 'table-primary', class2: '', name: 'Rhoda Report' },
  { id: 3, text: 'Secondary', color: 'secondary', quantity: '26', price: '$1,234',
    class1: 'table-secondary', class2: '', name: 'Rita Book' },
  { id: 4, text: 'Success', color: 'success', quantity: '42', price: '$2,623',
    class1: 'table-success', class2: '', name: 'Anne Teak' },
  { id: 5, text: 'Danger', color: 'danger', quantity: '52', price: '$32,132',
    class1: 'table-danger', class2: '', name: 'Dee End' },
  { id: 6, text: 'Warning', color: 'warning', quantity: '10', price: '$1,434',
    class1: 'table-warning', class2: '', name: 'Lee Nonmi' },
  { id: 7, text: 'Info', color: 'info', quantity: '63', price: '$1,854',
    class1: 'table-info', class2: '', name: 'Lynne Gwistic' },
  { id: 8, text: 'Light', color: 'light', quantity: '05', price: '$823',
    class1: 'table-light', class2: 'text-default', name: 'Fran Tick' },
  { id: 9, text: 'Dark', color: 'dark', quantity: '35', price: '$1,832',
    class1: 'table-dark', class2: '', name: 'Polly Pipe' }
];`
export const table30 = `<div className="table-responsive">
    <Table striped bordered className="table text-nowrap">
        <thead>
            <tr>
                <th scope="col">#</th>
                <th scope="col">First</th>
                <th scope="col">Last</th>
                <th scope="col">Handle</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <th scope="row">1</th>
                <td>Mark</td>
                <td>Otto</td>
                <td>@mdo</td>
            </tr>
            <tr>
                <td colSpan={4}>
                    <Table className="table text-nowrap mb-0">
                        <thead>
                            <tr>
                                <th scope="col">Aplhabets</th>
                                <th scope="col">Users</th>
                                <th scope="col">Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row">A</th>
                                <td>Dino King</td>
                                <td>dinoking231@gmail.com</td>
                            </tr>
                            <tr>
                                <th scope="row">B</th>
                                <td>Poppins sams</td>
                                <td>pops@gmail.com</td>
                            </tr>
                            <tr>
                                <th scope="row">C</th>
                                <td>Brian Shaw</td>
                                <td>swanbrian@gmail.com</td>
                            </tr>
                        </tbody>
                    </Table>
                </td>
            </tr>
            <tr>
                <th scope="row">3</th>
                <td>Larry</td>
                <td>the Bird</td>
                <td>@twitter</td>
            </tr>
            <tr>
                <th scope="row">4</th>
                <td>Jimmy</td>
                <td>the Ostrich</td>
                <td>Dummy Text</td>
            </tr>
            <tr>
                <th scope="row">5</th>
                <td>Cobra Kai</td>
                <td>the Snake</td>
                <td>Another Name</td>
            </tr>
        </tbody>
    </Table>
</div>`
export const table31 = `<div className="table-responsive">
    <Table className="table text-nowrap">
        <thead>
            <tr>
                <th scope="col">
                    <Form.Check className="" type="checkbox" id="checkboxNoLabel" value="" aria-label="..." /></th>
                <th scope="col">Team Head</th>
                <th scope="col">Category</th>
                <th scope="col">Role</th>
                <th scope="col">Gmail</th>
                <th scope="col">Team</th>
                <th scope="col">Work Progress</th>
                <th scope="col">Revenue</th>
                <th scope="col">Action</th>
            </tr>
        </thead>
        <tbody>
            {AlwaysResponsive.map((idx) => (
                <tr key={Math.random()}>
                    <th scope="row">
                        <Form.Check className="=" type="checkbox" id="checkboxNoLabel1" value="" aria-label="..." /></th>
                    <td>
                        <div className="d-flex align-items-center">
                            <span className="avatar avatar-xs me-2 online avatar-rounded">
                                <img src={idx.src} alt="img" />
                            </span>{idx.teemHead}
                        </div>
                    </td>
                    <td>{idx.category}</td>
                    <td><span className={'badge bg-$#38{idx.color}-transparent'}>{idx.role}</span></td>
                    <td>{idx.gmail}</td>
                    <td>
                        <div className="avatar-list-stacked">
                            {idx.team.slice(0, 5).map((idx) => (
                                <span className="avatar avatar-sm avatar-rounded" key={Math.random()}>
                                    <img src={idx.img1} alt='img' />
                                </span>
                            ))}
                            <Link className="avatar avatar-sm bg-primary text-fixed-white avatar-rounded" >
                                {idx.moreImg}
                            </Link>
                        </div>
                    </td>
                    <td>
                        <ProgressBar className="progress progress-xs" variant='primary' now={idx.workProgress} />
                    </td>
                    <td>{idx.revenue}</td>
                    <td>
                        <div className="hstack gap-2 fs-15">
                            <Link to="#" className="btn btn-icon btn-sm btn-success"><i className="ri-download-2-line"></i></Link>
                            <Link to="#" className="btn btn-icon btn-sm btn-info"><i className="ri-edit-line"></i></Link>
                        </div>
                    </td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`
export const datatable31 = `
interface table31 {
    id: number
    src: string
    teemHead: string
    category: string
    role: string
    color: string
    gmail: string
    team: array
    moreImg: string
    workProgress: string
    revenue: string
    progressColor: string
}
export const AlwaysResponsive = [
  { id: 1, src: "../../../../assets/images/faces/1.jpg", teemHead: "Mayor Kelly", category: "Manufacturer", role: "Team Lead", color: "primary", gmail: "mayorkrlly@gmail.com", 
   team: [{ img1: face1 }, { img1: face2 }, { img1: face14 }, { img1: face5 },], moreImg: "+4", workProgress: 50, revenue: "$10,984.29", progressColor: "primary" },
  { id: 2, src: "../../../../assets/images/faces/5.jpg", teemHead: "Andrew Garfield", category: "Managing Director", role: "Director", color: "warning", gmail: "andrewgarfield@gmail.com",
    team: [{ img1: face6 }, { img1: face14 }, { img1: face15 },], moreImg: "+10", workProgress: 90, revenue: "$1.4billion", progressColor: "primary" },
  { id: 3, src: "../../../../assets/images/faces/15.jpg", teemHead: "Simon Cowel", category: "Service Manager", role: "Manager", color: "success", gmail: "simoncowel234@gmail.com", 
   team: [{ img1: face1 }, { img1: face5 }], moreImg: "+4", workProgress: 40, revenue: "$7,123.21", progressColor: "primary" },
  { id: 4, src: "../../../../assets/images/faces/3.jpg", teemHead: "Mirinda Hers", category: "Recruiter", role: "Employee", color: "danger", gmail: "mirindahers@gmail.com", 
   team: [{ img1: face5 }, { img1: face10 }, { img1: face11 }], moreImg: "+8", workProgress: 20, revenue: "$2,325.45", progressColor: "primary" },
];`
export const table32 = ` <div className="table-responsive">
    <Table className="table align-middle">
        <thead>
            <tr>
                <th scope="col" className="w-25">Heading 1</th>
                <th scope="col" className="w-25">Heading 2</th>
                <th scope="col" className="w-25">Heading 3</th>
                <th scope="col" className="w-25">Heading 4</th>
            </tr>
        </thead>
        <tbody>
            {Table13data.map((idx) => (
                <tr key={Math.random()} className={idx.class1}>
                    <td>{idx.text1} <code>{idx.code1}</code> {idx.text2}</td>
                    <td>{idx.text1} <code>{idx.code1}</code> {idx.text2}</td>
                    <td className={idx.class2}>{idx.text3} <code>{idx.code2}</code> {idx.text4}</td>
                    <td>This here is some placeholder text, intended to take up
                        quite a
                        bit of vertical space, to demonstrate how the vertical
                        alignment
                        works in the preceding cells.</td>
                </tr>
            ))}
        </tbody>
    </Table>
</div>`  

export const datatable32 = `
interface table32 {
    id: number
    text1: string
    text2: string
    text3: string
    text4: string
    class1: string
    class2: string
    code1: array
    code2: string
}
export const Table13data = [
  { id: 1, text1: 'This cell inherits', text2: ' from the table', text3: 'This cell inherits ', text4: 'from the table', class1: '', class2: '', code1: 'vertical-align: middle;', code2: 'vertical-align: middle;' },
  { id: 2, text1: 'This cell inherits', text2: 'from the table row', text3: 'This cell inherits ', text4: 'from the table row', class1: 'align-bottom', class2: '', code1: 'vertical-align: bottom;', 
   code2: 'vertical-align: bottom;' },
  { id: 3, text1: 'This cell inherits', text2: ' from the table', text3: 'This cell is aligned to the top.', text4: '', class1: '', class2: 'align-top', code1: 'vertical-align: middle;', code2: '' },
];`