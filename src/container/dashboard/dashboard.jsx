import React, { Fragment, useEffect } from 'react';
import { Badge, Card, Col, ListGroup, Nav, Row, Tab, Table } from 'react-bootstrap';
import { Activity, Allprojects, Dashboard1, Externalchart, Internalchart, Latesttask, Latesttask2, Latesttask3, Ongoingprojects, Otherchart, Projectbudget, Projectsworkload, Projecttask, Tasktatistics } from './dashboarddata';
import { Link } from 'react-router-dom';

const Dashboard = () => {

    useEffect(() => {
        // Equivalent to Angular's constructor
        const header = document.querySelector('.single-page-header');
        if (header) {
          header.classList.add('d-none');
        }
    
        // Cleanup function, equivalent to ngOnDestroy
        return () => {
          if (header) {
            header.classList.remove('d-none');
          }
        };
      }, []); // Empty dependency array ensures this effect runs once on mount and cleanup on unmount
    
    return (
        <Fragment>
            
            {/* <!-- row --> */}
            {/* <Row className="row-sm">
                {Dashboard1.map(idx => (
                    <Col xl={3} lg={6} md={6} sm={12} key={Math.random()}>
                        <Card className="overflow-hidden project-card">
                            <Card.Body className="">
                                <div className="d-flex">
                                    <div className="my-auto">
                                        {idx.icon}
                                    </div>
                                    <div className="project-content">
                                        <h6>{idx.type}</h6>
                                        <ul>
                                            <li>
                                                <strong>{idx.upperStatus}</strong>
                                                <span>{idx.upperNumber}</span>
                                            </li>

                                            <li>
                                                <strong>{idx.lowerStatus}</strong>
                                                <span>{idx.LowerNumber}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row> */}
            {/* <!-- row --> */}

            {/* <!-- row --> */}
            {/* <Row className=" row-sm ">
                <Col xl={8} lg={12} md={12} sm={12} className="">
                    <Card className=" overflow-hidden">
                        <Card.Header className="card-header bg-transparent p-4">
                            <div className="d-flex justify-content-between">
                                <h4 className="card-title mg-b-10">Project Budget</h4>
                            </div>
                            <p className="fs-12 text-muted mb-2">The Project Budget is a tool used by project managers to estimate the total cost of a project. <Link to="#" className="text-primary" >Learn more</Link></p>
                        </Card.Header>

                        <Card.Body className=" pd-y-7">
                            <div className="area chart-legend mb-0 d-flex justify-content-center">
                                <div className="ms-2">
                                    <i className="mdi mdi-album text-primary"></i> Total Budget
                                </div>
                                <div className="ms-2">
                                    <i className="mdi mdi-album text-pink"></i>Amount Used
                                </div>
                            </div>
                            <div id="projectbudget">
                                <Projectbudget />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xl={4} lg={12} md={12} sm={12}>
                    <Card className=" overflow-hidden">
                        <Card.Body className=" pb-3">
                            <Card.Header className="">
                                <h4 className="card-title mg-b-10">project &amp; task</h4>
                                <p className="fs-12 text-muted mb-3">In project, a task is an activity that needs to be accomplished within a defined period of time or by a deadline. <Link  to="#" className="text-primary" >Learn more</Link ></p>
                            </Card.Header>
                            <div className="table-responsive mb-0 projects-stat fs-14">
                                <Table className=" table-hover table-bordered mb-0 text-md-nowrap text-lg-nowrap text-xl-nowrap">
                                    <thead>
                                        <tr>
                                            <th>Project &amp; Task</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {Projecttask.map(idx => (
                                            <tr key={Math.random()}>
                                                <td>
                                                    <div className="project-names">
                                                        <h6 className={`bg-${idx.textBg}-transparent text-${idx.textBg} d-inline-block me-2 text-center`}>{idx.text}</h6>
                                                        <p className="d-inline-block font-weight-semibold mb-0 fs-14">{idx.taskName}</p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge bg={idx.statusbg} className="">{idx.status}</Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row> */}
            {/* <!-- /row --> */}

            {/* <!-- row --> */}
            {/* <Row className=" row-sm">
                <Col lg={6} xl={4} md={12} sm={12} className="">
                    <Card className=" overflow-hidden latest-tasks">
                        <Tab.Container defaultActiveKey="first">
                            <div className="">
                                <div className="d-flex justify-content-between ps-4 pt-4 pe-4">
                                    <Card.Title className="card-title mg-b-10">Latest Task</Card.Title>
                                </div>
                                <div className="">
                                    <Nav as="ul" className="nav-tabs nav-tabs-line nav-tabs-line-brand nav-tabs-bold" role="tablist">
                                        <Nav.Item>
                                            <Nav.Link eventKey="first" className="show" data-bs-toggle="tab" role="tab" aria-selected="false">
                                                Today
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="second" className="" data-bs-toggle="tab" role="tab" aria-selected="false">
                                                Week
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="third" className="" data-bs-toggle="tab" role="tab" aria-selected="true">
                                                Month
                                            </Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </div>
                            </div>
                            <Card.Body className="pt-3">
                                <Tab.Content>
                                    <Tab.Pane eventKey="first" className="fade border-0 p-0 show" id="tasktab-1" role="tabpanel">
                                        <div className="">
                                            {Latesttask.map(idx => (
                                                <div className="tasks" key={Math.random()}>
                                                    <div className={`task-line ${idx.color} ${idx.active}`} >
                                                        <Link className="label">
                                                            {idx.label}
                                                        </Link >
                                                        <div className="time">
                                                            {idx.time}
                                                        </div>
                                                    </div>
                                                    <span className="add-delete-task ">
                                                        <Link to="#" className="btn btn-link">
                                                            <i className="fa fa-edit"></i>
                                                        </Link >
                                                        <Link to="#" className="btn btn-link"><i className="fa fa-trash"></i></Link >
                                                    </span>
                                                    <div className="checkbox">
                                                        <div className="check-box">
                                                            <div className="ckbox"><input className="form-check-input" type="checkbox" value="" defaultChecked={idx.checked} /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="second" className="fade border-0 p-0" id="tasktab-2" role="tabpanel">
                                        <div className="">
                                            {Latesttask2.map(idx => (
                                                <div className="tasks" key={Math.random()}>
                                                    <div className={`task-line ${idx.color}`} >
                                                        <Link to="#" className="label">
                                                            {idx.label}
                                                        </Link >
                                                        <div className="time">
                                                            {idx.time}
                                                        </div>
                                                    </div>
                                                    <span className="add-delete-task ">
                                                        <Link to="#" className="btn btn-link">
                                                            <i className="fa fa-edit"></i>
                                                        </Link >
                                                        <Link to="#" className="btn btn-link"><i className="fa fa-trash"></i></Link >
                                                    </span>
                                                    <div className="checkbox">
                                                        <div className="check-box">
                                                            <label className="ckbox"><input className="form-check-input" type="checkbox" defaultChecked={idx.checked} /></label>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="third" className="fade border-0 p-0" id="tasktab-3" role="tabpanel">
                                        <div className="">
                                            {Latesttask3.map(idx => (
                                                <div className="tasks " key={Math.random()}>
                                                    <div className={`task-line ${idx.color}`} >
                                                        <Link to="#" className="label">
                                                            {idx.label}
                                                        </Link >
                                                        <div className="time">
                                                            {idx.time}
                                                        </div>
                                                    </div>
                                                    <span className="add-delete-task ">
                                                        <Link to="#" className="btn btn-link">
                                                            <i className="fa fa-edit"></i>
                                                        </Link >
                                                        <Link to="#" className="btn btn-link"><i className="fa fa-trash"></i></Link >
                                                    </span>
                                                    <div className="checkbox">
                                                        <div className="check-box">
                                                            <label className="ckbox"><input className="form-check-input" type="checkbox" defaultChecked={idx.checked} /></label>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Tab.Pane>
                                </Tab.Content>
                            </Card.Body>
                        </Tab.Container>
                    </Card>
                </Col>
                <Col sm={12} md={12} lg={6} xl={4} className=" ">
                    <Card className="card overflow-hidden">
                        <Card.Header className=" pb-0">
                            <Card.Title className=" mg-b-10 mt-2">Projects Workload</Card.Title>
                            <p className="fs-12 text-muted mb-0"> In the Project Workload report, their remaining assignments, completion dates, whether their work is at-risk. <Link className="text-primary" >Learn more</Link ></p>
                        </Card.Header>
                        <Card.Body className="y">
                            <div className="">
                                <Row className=" justify-content-md-center">
                                    <Col sm={12} className="">
                                        <div id="projectworkloadchart">
                                            <Projectsworkload />
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                            <div className="pt-3 px-3">
                                <Row className=" ">
                                    <Col sm={8} lg={7} xl={6} className="">
                                        <h5 className="mb-0 fs-15 d-flex"><span className="legend bg-primary-gradient brround"></span>40.32%</h5>
                                        <p className="text-muted  fs-13 mb-0">External</p>
                                    </Col>
                                    <Col sm={4} lg={5} xl={6} className="">
                                        <div id="externalchart" className="float-end">
                                            <Externalchart />
                                        </div>
                                    </Col>
                                </Row>
                            </div>

                            <div className="pt-3 px-3">
                                <Row className=" ">
                                    <Col sm={8} lg={7} xl={6} className="">
                                        <h6 className="mb-0 fs-15 d-flex"><span className="legend bg-danger-gradient brround"></span>40.73%</h6>
                                        <p className="text-muted fs-13 mb-0 ">Internal</p>
                                    </Col>
                                    <Col sm={4} lg={5} xl={6} className="">
                                        <div id="internalchart" className="float-end">
                                            <Internalchart />
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                            <div className="pt-3 px-3">
                                <Row className=" ">
                                    <Col sm={8} lg={7} xl={6} className="">
                                        <h6 className="mb-0 fs-15 d-flex"><span className="legend bg-success-gradient brround"></span>50.12%</h6>
                                        <p className="text-muted fs-13 mb-0">Other</p>
                                    </Col>
                                    <Col sm={4} lg={5} xl={6} className="">
                                        <div id="otherchart" className="float-end">
                                            <Otherchart />
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={12} xl={4} md={12} sm={12} className="">
                    <Card className=" card-dashboard-events">
                        <Card.Header className="">
                            <Card.Title className=" mg-b-10 mt-2">Upcoming Events</Card.Title>
                            <p className="fs-12 text-muted mb-0">It had the latest news and notes from the championship, while previewing the upcoming event.. <Link to="#" className="text-primary" >Learn more</Link ></p>
                        </Card.Header>
                        <Card.Body className=" p-0">
                            <ListGroup className=" ">
                                <ListGroup.Item className=" border-top-0 mb-2">
                                    <div className="event-indicator bg-primary-gradient"></div><label>Nov 20 <span>Tuesday</span></label>
                                    <h6>PH World Mall Lantern Festival</h6>
                                    <p><strong>8AM - 4PM</strong> Bay Area, San Francisco</p><small><span className="text-danger">Sold Out</span> (3000 tickets sold)</small>
                                </ListGroup.Item>
                                <ListGroup.Item className="mb-2">
                                    <div className="event-indicator bg-danger-gradient"></div><label>Nov 23 <span>Friday</span></label>
                                    <h6>Asia Pacific Generation Workshop</h6>
                                    <p><strong>8AM - 5PM</strong> Singapore</p><small><span className="text-warning">Sold Out Soon</span> (12 tickets left)</small>
                                </ListGroup.Item>
                                <ListGroup.Item className="list-group-item border-bottom-0 ">
                                    <div className="event-indicator bg-info-gradient"></div><label>Nov 23 <span>Friday</span></label>
                                    <h6>Korea Smart Device Trade Show</h6>
                                    <p><strong>8AM - 5PM</strong> Singapore</p><small><span className="text-success">Free Registration</span> (Limited seats only)</small>
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row> */}
            {/* <!-- /row --> */}

            {/* <!-- row --> */}
            {/* <Row className=" row-sm ">
                <Col md={12} xl={12} className="">
                    <Card className="card overflow-hidden review-project">
                        <Card.Body className="">
                            <div className="d-flex justify-content-between">
                                <Card.Title className="card-title mg-b-10">All Projects</Card.Title>
                            </div>
                            <p className="fs-12 text-muted mb-3">A project is an activity to meet the creation of a unique product or service and thus activities that are undertaken to accomplish routine activities cannot be considered projects. <Link to="#" className="text-primary" >Learn more</Link ></p>
                            <div className="table-responsive mb-0">
                                <Table hover striped className="  table-bordered mb-0 text-md-nowrap text-lg-nowrap text-xl-nowrap">
                                    <thead>
                                        <tr>
                                            <th>Project</th>
                                            <th>Team Members</th>
                                            <th>Categorie</th>
                                            <th>Created</th>
                                            <th>Status</th>
                                            <th>Deadline</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Allprojects.map(idx => (
                                            <tr key={Math.random()}>
                                                <td>
                                                    <div className="project-contain">
                                                        <h6 className="mb-1 fs-13">{idx.name}</h6>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="avatar-list-stacked image-grouped wd-100">
                                                        {idx.avatars.map((avatar) => (
                                                            <span key={Math.random()} className="avatar avatar-rounded profile-img">
                                                                <img src={avatar} alt="img" />
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td>{idx.category}</td>
                                                <td>{idx.startDate}</td>
                                                <td><Badge bg={idx.badgeColor} className="">{idx.status}</Badge></td>
                                                <td>{idx.endDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row> */}
            {/* <!-- /row --> */}

            {/* <!-- row --> */}
            {/* <Row className=" row-sm ">
                <Col lg={12} xl={4} sm={12} className="">
                    <Card className="">
                        <Card.Header className=" pb-0 pt-4">
                            <div className="d-flex justify-content-between">
                                <Card.Title className=" mg-b-10">Top Ongoing Projects</Card.Title>
                            </div>
                            <p className="fs-12 text-muted mb-0">Project Description is a formally written declaration of the project and its idea and context . <Link to="#" className="text-primary" >Learn more</Link ></p>
                        </Card.Header>
                        <Card.Body className=" p-0 m-scroll mh-350 mt-2">

                            <ListGroup className="projects-list">
                                {Ongoingprojects.map(idx => (
                                    <ListGroup.Item action className="list-group-item-action flex-column align-items-start border-0 border-bottom" key={Math.random()}>
                                        <div className="d-flex w-100 justify-content-between">
                                            <h6 className="mb-1 font-weight-semibold ">{idx.title}</h6>
                                            <small className={idx.statusClass}><i className={`fa ${idx.iconClass} me-1`}></i>{idx.date}</small>
                                        </div>
                                        <p className="mb-0 text-muted mb-0 fs-12">{idx.startDate}</p>
                                        <small className="text-muted">{idx.description}</small>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xl={4} lg={6} md={12} className="">
                    <Card className="card overflow-hidden ">
                        <Card.Header className=" pb-0 pt-4">
                            <div className="d-flex justify-content-between">
                                <Card.Title className=" mg-b-10 ">Activity</Card.Title>
                            </div>
                            <p className="fs-12 text-muted mb-0">An activity is a scheduled phase in a project plan with a distinct beginning and end. <Link to="#" className="text-primary" >Learn more</Link ></p>
                        </Card.Header>
                        <div className="">
                            <Card.Body className="activity activity-scroll">
                                {Activity.map(idx => (
                                    <div className="activity-list" key={Math.random()}>
                                        <img src={idx.image} alt="" className="img-activity" />
                                        <div className="time-activity ">
                                            <div className="item-activity">
                                                <p className="mb-0"><span className="h6 me-1">{idx.name}</span><span className="text-muted fs-13"> {idx.action}</span> <span className={`h6 ms-1 added-project ${idx.projectClass}`}> {idx.project}</span></p><small className="text-muted ">{idx.time}</small> </div>
                                        </div>
                                    </div>
                                ))}
                            </Card.Body>
                        </div>
                    </Card>
                </Col>
                <Col md={12} lg={6} xl={4} className="">
                    <Card className="">
                        <Card.Header className=" pt-4 pb-0">
                            <div className="d-flex justify-content-between">
                                <Card.Title className=" mg-b-10 ">Task Statistics</Card.Title>
                            </div>
                            <p className="fs-12 text-muted mb-0">The Statistics You can also summarize your data in a graphical display, such as histograms <Link to="#" className="text-primary" >Learn more</Link > </p>
                        </Card.Header>
                        <div className="p-4">
                            <div className="">
                                <Row className="">
                                    <Col md={6} className=" col-6 text-center">
                                        <div className="task-box primary mb-0">
                                            <p className="mb-0 fs-12">Total Tasks</p>
                                            <h3 className="mb-0 text-fixed-white">385</h3>
                                        </div>
                                    </Col>
                                    <Col md={6} className=" col-6 text-center">
                                        <div className="task-box danger  mb-0">
                                            <p className="mb-0 fs-11">Overdue Tasks</p>
                                            <h3 className="mb-0 text-fixed-white">19</h3>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                        {Tasktatistics.map(idx => (
                            <div className="task-stat pb-0" key={Math.random()}>
                                <div className="d-flex tasks">
                                    <div className="mb-0">
                                        <div className="h6 fs-15 mb-0"><i className={`${idx.icon} me-2`}></i>{idx.title}</div>
                                        <span className="text-muted fs-11 ms-4">{idx.timeRange}</span>
                                    </div>
                                    <span className="float-end ms-auto">{idx.count}</span>
                                </div>
                            </div>
                        ))}
                    </Card>
                </Col>
            </Row> */}
            {/* <!-- row --> */}
        </Fragment >
    );
};
export default Dashboard;
