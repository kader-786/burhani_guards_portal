import React, { Component } from "react";
import Chart from "react-apexcharts";
import face11 from '../../../src/assets/images/faces/11.jpg';
import face12 from '../../../src/assets/images/faces/12.jpg';
import face2 from '../../../src/assets/images/faces/2.jpg';
import face16 from '../../../src/assets/images/faces/16.jpg'
import face8 from '../../../src/assets/images/faces/8.jpg';
import face7 from '../../../src/assets/images/faces/7.jpg';
import face3 from '../../../src/assets/images/faces/3.jpg';
import face15 from '../../../src/assets/images/faces/15.jpg';
import face6 from '../../../src/assets/images/faces/6.jpg';
import face9 from '../../../src/assets/images/faces/9.jpg';
import face4 from '../../../src/assets/images/faces/4.jpg';
import face5 from '../../../src/assets/images/faces/5.jpg';
import face10 from '../../../src/assets/images/faces/10.jpg';
//Total Budget
export class Projectbudget extends Component {
    constructor(props) {
        super(props);
        this.state = {
            series: [
                {
                    name: 'series1',
                    data: [0, 150, 65, 160, 70, 130, 70, 120]
                },
                {
                    name: 'series2',
                    data: [50, 90, 210, 90, 150, 75, 200, 70]
                }
            ],
            options: {
                chart: {
                    height: 350,
                    type: 'area',
                    toolbar: {
                        show: false,
                    },
                },
                colors: [ '#3858f9',  '#f54266'],
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    curve: 'smooth',
                    width: 2
                },
                grid: {
                    borderColor: '#f2f5f7',
                },
                xaxis: {
                    type: 'month',
                    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug"],
                    labels: {
                        show: true,
                        style: {
                            colors: "#8c9097",
                            fontSize: '11px',
                            fontWeight: 600,
                            cssClass: 'apexcharts-xaxis-label',
                        },
                    }
                },
                yaxis: {
                    labels: {
                        show: false,
                        style: {
                            colors: "#8c9097",
                            fontSize: '11px',
                            fontWeight: 600,
                            cssClass: 'apexcharts-xaxis-label',
                        },
                    }
                },
                tooltip: {
                    x: {
                        format: 'dd/MM/yy HH:mm'
                    },
                },
                legend: {
                    show: false,
                },
            }
        };
    }

    render() {
        return (
            <div>
                <Chart options={this.state.options} series={this.state.series} type="area" height={350} />
            </div>
        );
    }
}

//Projects Workload
export class Projectsworkload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            series: [1554, 1234, 1854],
            options: {
                labels: ["Extenal", "Internal", "other"],
                chart: {
                    height: 180,
                    type: 'donut'
                },
                dataLabels: {
                    enabled: false,
                },

                legend: {
                    show: false,
                },
                stroke: {
                    show: true,
                    curve: 'smooth',
                    lineCap: 'round',
                    colors: "#fff",
                    width: 0,
                    dashArray: 0,
                },
                plotOptions: {

                    pie: {
                        expandOnClick: false,
                        donut: {
                            size: '75%',
                            background: 'transparent',
                            labels: {
                                show: false,
                                name: {
                                    show: false,
                                    fontSize: '20px',
                                    color: '#495057',
                                    offsetY: -4
                                },
                                value: {
                                    show: false,
                                    fontSize: '18px',
                                    color: undefined,
                                    offsetY: 8,
                                    formatter: function (val) {
                                        return val + "%"
                                    }
                                },
                                total: {
                                    show: false,
                                    showAlways: true,
                                    label: 'Total',
                                    fontSize: '22px',
                                    fontWeight: 600,
                                    color: '#495057',
                                }

                            }
                        }
                    }
                },
                colors: ["var(--primary-color)", "#f09819", "#3cba92"],
            }
        }
    }
    render() {
        return (
            <div>
                <Chart options={this.state.options} series={this.state.series} type="donut" height={200} />
            </div>
        );
    }
}
//External
export class Externalchart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            series: [{
                name: 'Value',
                data: [1,3,7,8,4,5,4,8,6]
              }],
            options: {
                chart: {
                    type: 'line',
                    height: 30,
                    width: 120,
                    sparkline: {
                      enabled: true
                    },
                    dropShadow: {
                      enabled: true,
                      enabledOnSeries: undefined,
                      top: 0,
                      left: 0,
                      blur: 3,
                      color: '#000',
                      opacity: 0.1
                    }
                  },
                  stroke: {
                    show: true,
                    curve: 'smooth',
                    lineCap: 'butt',
                    colors: undefined,
                    width: 1.5,
                    dashArray: 0,
                  },
                  fill: {
                    gradient: {
                      enabled: false
                    }
                  },
                  tooltip: {
                    enabled: false,
                  },
                 
                  yaxis: {
                    min: 0,
                    show: false,
                    axisBorder: {
                      show: false
                    },
                  },
                  xaxis: {
                    axisBorder: {
                      show: false
                    },
                  },
                  colors: ["var(--primary-color)",],
            }
        }
    }
    render() {
        return (
            <div>
                <Chart options={this.state.options} series={this.state.series} type="line" height={20} width={120} />
            </div>
        );
    }
}
//Internal
export class Internalchart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            series: [{
                name: 'Value',
                data: [1, 3, 7, 8, 4, 5, 4, 8, 6]
            }],
            options: {
                chart: {
                    type: 'line',
                    height: 30,
                    width: 120,
                    sparkline: {
                        enabled: true
                    },
                    dropShadow: {
                        enabled: true,
                        enabledOnSeries: undefined,
                        top: 0,
                        left: 0,
                        blur: 3,
                        color: '#000',
                        opacity: 0.1
                    }
                },
                stroke: {
                    show: true,
                    curve: 'smooth',
                    lineCap: 'butt',
                    colors: undefined,
                    width: 1.5,
                    dashArray: 0,
                },
                fill: {
                    gradient: {
                        enabled: false
                    }
                },
                tooltip: {
                    enabled: false,
                },
                yaxis1: {
                    min: 0,
                    show: false
                },
                xaxis: {
                    axisBorder: {
                        show: false
                    },
                },
                yaxis2: {
                    axisBorder: {
                        show: false
                    },
                },
                colors: ['#f09819'],
            }
        }
    }
    render() {
        return (
            <div>
                <Chart options={this.state.options} series={this.state.series} type="line" height={20} width={120} />
            </div>
        );
    }
}
//Other
export class Otherchart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            series: [{
                name: 'Value',
                data: [1, 3, 7, 8, 4, 5, 4, 8, 6]
            }],
            options: {
                chart: {
                    type: 'line',
                    height: 30,
                    width: 120,
                    sparkline: {
                        enabled: true
                    },
                    dropShadow: {
                        enabled: true,
                        enabledOnSeries: undefined,
                        top: 0,
                        left: 0,
                        blur: 3,
                        color: '#000',
                        opacity: 0.1
                    }
                },
                stroke: {
                    show: true,
                    curve: 'smooth',
                    lineCap: 'butt',
                    colors: undefined,
                    width: 1.5,
                    dashArray: 0,
                },
                fill: {
                    gradient: {
                        enabled: false
                    }
                },
                tooltip: {
                    enabled: false,
                },
                yaxis1: {
                    min: 0,
                    show: false
                },
                xaxis: {
                    axisBorder: {
                        show: false
                    },
                },
                yaxis2: {
                    axisBorder: {
                        show: false
                    },
                },
                colors: ['#3cba92'],
            }
        }
    }
    render() {
        return (
            <div>
                <Chart options={this.state.options} series={this.state.series} type="line" height={20} width={120} />
            </div>
        );
    }
}


export const Dashboard1 = [
    {
        id: 1,
        icon: (<svg enableBackground="new 0 0 469.682 469.682" version="1.1" className="me-4 ht-60 wd-60 my-auto primary" viewBox="0 0 469.68 469.68" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg">
            <path d="m120.41 298.32h87.771c5.771 0 10.449-4.678 10.449-10.449s-4.678-10.449-10.449-10.449h-87.771c-5.771 0-10.449 4.678-10.449 10.449s4.678 10.449 10.449 10.449z" />
            <path d="m291.77 319.22h-171.36c-5.771 0-10.449 4.678-10.449 10.449s4.678 10.449 10.449 10.449h171.36c5.771 0 10.449-4.678 10.449-10.449s-4.678-10.449-10.449-10.449z" />
            <path d="m291.77 361.01h-171.36c-5.771 0-10.449 4.678-10.449 10.449s4.678 10.449 10.449 10.449h171.36c5.771 0 10.449-4.678 10.449-10.449s-4.678-10.449-10.449-10.449z" />
            <path d="m420.29 387.14v-344.82c0-22.987-16.196-42.318-39.183-42.318h-224.65c-22.988 0-44.408 19.331-44.408 42.318v20.376h-18.286c-22.988 0-44.408 17.763-44.408 40.751v345.34c0.68 6.37 4.644 11.919 10.449 14.629 6.009 2.654 13.026 1.416 17.763-3.135l31.869-28.735 38.139 33.959c2.845 2.639 6.569 4.128 10.449 4.18 3.861-0.144 7.554-1.621 10.449-4.18l37.616-33.959 37.616 33.959c5.95 5.322 14.948 5.322 20.898 0l38.139-33.959 31.347 28.735c3.795 4.671 10.374 5.987 15.673 3.135 5.191-2.98 8.232-8.656 7.837-14.629v-74.188l6.269-4.702 31.869 28.735c2.947 2.811 6.901 4.318 10.971 4.18 1.806 0.163 3.62-0.2 5.224-1.045 5.493-2.735 8.793-8.511 8.361-14.629zm-83.591 50.155-24.555-24.033c-5.533-5.656-14.56-5.887-20.376-0.522l-38.139 33.959-37.094-33.959c-6.108-4.89-14.79-4.89-20.898 0l-37.616 33.959-38.139-33.959c-6.589-5.4-16.134-5.178-22.465 0.522l-27.167 24.033v-333.84c0-11.494 12.016-19.853 23.51-19.853h224.65c11.494 0 18.286 8.359 18.286 19.853v333.84zm62.693-61.649-26.122-24.033c-4.18-4.18-5.224-5.224-15.673-3.657v-244.51c1.157-21.321-15.19-39.542-36.51-40.699-0.89-0.048-1.782-0.066-2.673-0.052h-185.47v-20.376c0-11.494 12.016-21.42 23.51-21.42h224.65c11.494 0 18.286 9.927 18.286 21.42v333.32z" />
            <path d="m232.21 104.49h-57.47c-11.542 0-20.898 9.356-20.898 20.898v104.49c0 11.542 9.356 20.898 20.898 20.898h57.469c11.542 0 20.898-9.356 20.898-20.898v-104.49c1e-3 -11.542-9.356-20.898-20.897-20.898zm0 123.3h-57.47v-13.584h57.469v13.584zm0-34.482h-57.47v-67.918h57.469v67.918z" />
        </svg>),
        type: "Invoices", upperStatus: "Processing", lowerStatus: "Paid", upperNumber: "5", LowerNumber: "56"
    },
    {
        id: 2,
        icon: (<svg enableBackground="new 0 0 438.891 438.891" className="me-4 ht-60 wd-60 my-auto danger" version="1.1" viewBox="0 0 438.89 438.89" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg">
            <path d="m347.97 57.503h-39.706v-17.763c0-5.747-6.269-8.359-12.016-8.359h-30.824c-7.314-20.898-25.6-31.347-46.498-31.347-20.668-0.777-39.467 11.896-46.498 31.347h-30.302c-5.747 0-11.494 2.612-11.494 8.359v17.763h-39.707c-23.53 0.251-42.78 18.813-43.886 42.318v299.36c0 22.988 20.898 39.706 43.886 39.706h257.04c22.988 0 43.886-16.718 43.886-39.706v-299.36c-1.106-23.506-20.356-42.068-43.886-42.319zm-196.44-5.224h28.735c5.016-0.612 9.045-4.428 9.927-9.404 3.094-13.474 14.915-23.146 28.735-23.51 13.692 0.415 25.335 10.117 28.212 23.51 0.937 5.148 5.232 9.013 10.449 9.404h29.78v41.796h-135.84v-41.796zm219.43 346.91c0 11.494-11.494 18.808-22.988 18.808h-257.04c-11.494 0-22.988-7.314-22.988-18.808v-299.36c1.066-11.964 10.978-21.201 22.988-21.42h39.706v26.645c0.552 5.854 5.622 10.233 11.494 9.927h154.12c5.98 0.327 11.209-3.992 12.016-9.927v-26.646h39.706c12.009 0.22 21.922 9.456 22.988 21.42v299.36z" />
            <path d="m179.22 233.57c-3.919-4.131-10.425-4.364-14.629-0.522l-33.437 31.869-14.106-14.629c-3.919-4.131-10.425-4.363-14.629-0.522-4.047 4.24-4.047 10.911 0 15.151l21.42 21.943c1.854 2.076 4.532 3.224 7.314 3.135 2.756-0.039 5.385-1.166 7.314-3.135l40.751-38.661c4.04-3.706 4.31-9.986 0.603-14.025-0.19-0.211-0.391-0.412-0.601-0.604z" />
            <path d="m329.16 256.03h-120.16c-5.771 0-10.449 4.678-10.449 10.449s4.678 10.449 10.449 10.449h120.16c5.771 0 10.449-4.678 10.449-10.449s-4.678-10.449-10.449-10.449z" />
            <path d="m179.22 149.98c-3.919-4.131-10.425-4.364-14.629-0.522l-33.437 31.869-14.106-14.629c-3.919-4.131-10.425-4.364-14.629-0.522-4.047 4.24-4.047 10.911 0 15.151l21.42 21.943c1.854 2.076 4.532 3.224 7.314 3.135 2.756-0.039 5.385-1.166 7.314-3.135l40.751-38.661c4.04-3.706 4.31-9.986 0.603-14.025-0.19-0.211-0.391-0.412-0.601-0.604z" />
            <path d="m329.16 172.44h-120.16c-5.771 0-10.449 4.678-10.449 10.449s4.678 10.449 10.449 10.449h120.16c5.771 0 10.449-4.678 10.449-10.449s-4.678-10.449-10.449-10.449z" />
            <path d="m179.22 317.16c-3.919-4.131-10.425-4.363-14.629-0.522l-33.437 31.869-14.106-14.629c-3.919-4.131-10.425-4.363-14.629-0.522-4.047 4.24-4.047 10.911 0 15.151l21.42 21.943c1.854 2.076 4.532 3.224 7.314 3.135 2.756-0.039 5.385-1.166 7.314-3.135l40.751-38.661c4.04-3.706 4.31-9.986 0.603-14.025-0.19-0.21-0.391-0.411-0.601-0.604z" />
            <path d="m329.16 339.63h-120.16c-5.771 0-10.449 4.678-10.449 10.449s4.678 10.449 10.449 10.449h120.16c5.771 0 10.449-4.678 10.449-10.449s-4.678-10.449-10.449-10.449z" />
        </svg>),
        type: "Tasks", upperStatus: "Processing", lowerStatus: "Completed", upperNumber: "42", LowerNumber: "23"
    },
    {
        id: 3,
        icon: (<svg enableBackground="new 0 0 477.849 477.849" className="me-4 ht-60 wd-60 my-auto success" version="1.1" viewBox="0 0 477.85 477.85" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg">
            <path d="m374.1 385.52c71.682-74.715 69.224-193.39-5.492-265.08-34.974-33.554-81.584-52.26-130.05-52.193-103.54-0.144-187.59 83.676-187.74 187.22-0.067 48.467 18.639 95.077 52.193 130.05l-48.777 65.024c-5.655 7.541-4.127 18.238 3.413 23.893s18.238 4.127 23.893-3.413l47.275-63.044c65.4 47.651 154.08 47.651 219.48 0l47.275 63.044c5.655 7.541 16.353 9.069 23.893 3.413 7.541-5.655 9.069-16.353 3.413-23.893l-48.775-65.024zm-135.54 24.064c-84.792-0.094-153.51-68.808-153.6-153.6 0-84.831 68.769-153.6 153.6-153.6s153.6 68.769 153.6 153.6-68.769 153.6-153.6 153.6z" />
            <path d="m145.29 24.984c-33.742-32.902-87.767-32.221-120.67 1.521-32.314 33.139-32.318 85.997-8e-3 119.14 6.665 6.663 17.468 6.663 24.132 0l96.546-96.529c6.663-6.665 6.663-17.468 0-24.133zm-106.55 82.398c-12.186-25.516-1.38-56.08 24.136-68.267 13.955-6.665 30.175-6.665 44.131 0l-68.267 68.267z" />
            <path d="m452.49 24.984c-33.323-33.313-87.339-33.313-120.66 0-6.663 6.665-6.663 17.468 0 24.132l96.529 96.529c6.665 6.663 17.468 6.663 24.132 0 33.313-33.322 33.313-87.338 0-120.66zm-14.08 82.449-68.301-68.301c19.632-9.021 42.79-5.041 58.283 10.018 15.356 15.341 19.371 38.696 10.018 58.283z" />
            <path d="m238.56 136.52c-9.426 0-17.067 7.641-17.067 17.067v96.717l-47.787 63.71c-5.655 7.541-4.127 18.238 3.413 23.893s18.238 4.127 23.893-3.413l51.2-68.267c2.216-2.954 3.413-6.547 3.413-10.24v-102.4c1e-3 -9.426-7.64-17.067-17.065-17.067z" />
        </svg>),
        type: "Estimates", upperStatus: "Processing", lowerStatus: "Accepted", upperNumber: "2", LowerNumber: "16"
    },
    {
        id: 4,
        icon: (<svg enableBackground="new 0 0 512 512" className="me-4 ht-60 wd-60 my-auto warning" version="1.1" viewBox="0 0 512 512" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg">
            <path d="m259.2 317.72h-6.398c-8.174 0-14.824-6.65-14.824-14.824 1e-3 -8.172 6.65-14.822 14.824-14.822h6.398c8.174 0 14.825 6.65 14.825 14.824h29.776c0-20.548-13.972-37.885-32.911-43.035v-33.74h-29.777v33.739c-18.94 5.15-32.911 22.487-32.911 43.036 0 24.593 20.007 44.601 44.601 44.601h6.398c8.174 0 14.825 6.65 14.825 14.824s-6.65 14.824-14.825 14.824h-6.398c-8.174 0-14.824-6.65-14.824-14.824h-29.777c0 20.548 13.972 37.885 32.911 43.036v33.739h29.777v-33.74c18.94-5.15 32.911-22.487 32.911-43.035 0-24.594-20.008-44.603-44.601-44.603z" />
            <path d="m502.7 432.52c-7.232-60.067-26.092-111.6-57.66-157.56-27.316-39.764-65.182-76.476-115.59-112.06v-46.29l37.89-98.425-21.667-0.017c-6.068-4e-3 -8.259-1.601-13.059-5.101-6.255-4.559-14.821-10.802-30.576-10.814h-0.046c-15.726 0-24.292 6.222-30.546 10.767-4.799 3.487-6.994 5.081-13.041 5.081h-0.027c-6.07-5e-3 -8.261-1.602-13.063-5.101-6.255-4.559-14.821-10.801-30.577-10.814h-0.047c-15.725 0-24.293 6.222-30.548 10.766-4.8 3.487-6.995 5.081-13.044 5.081h-0.027l-21.484-0.017 36.932 98.721v46.117c-51.158 36.047-89.636 72.709-117.47 111.92-33.021 46.517-52.561 98.116-59.74 157.74l-9.304 77.285h512l-9.304-77.284zm-301.06-395.47c4.8-3.487 6.995-5.081 13.045-5.081h0.026c6.07 4e-3 8.261 1.602 13.062 5.101 6.255 4.559 14.821 10.802 30.578 10.814h0.047c15.725 0 24.292-6.222 30.546-10.767 4.799-3.487 6.993-5.081 13.041-5.081h0.026c6.068 5e-3 8.259 1.602 13.059 5.101 2.869 2.09 6.223 4.536 10.535 6.572l-21.349 55.455h-92.526l-20.762-55.5c4.376-2.041 7.773-4.508 10.672-6.614zm98.029 91.89v26.799h-83.375v-26.799h83.375zm-266.09 351.08 5.292-43.947c6.571-54.574 24.383-101.7 54.458-144.07 26.645-37.537 62.54-71.458 112.73-106.5h103.78c101.84 71.198 150.75 146.35 163.29 250.56l5.291 43.948h-444.85z" />
        </svg>),
        type: "Revenue", upperStatus: "Earnings", lowerStatus: "Expensive", upperNumber: "$15,425", LowerNumber: "$8,147"
    },
]


export const Projecttask = [
    { id: 1, textBg: "primary", textColor: "primary", text: "U", taskName: "UI Design", statusbg: "success", status: "Completed" },
    { id: 2, textBg: "pink", textColor: "pink", text: "R", taskName: "Landing Page", statusbg: "warning", status: "Pending" },
    { id: 3, textBg: "success", textColor: "success", text: "W", taskName: "Website & Blog", statusbg: "danger", status: "Cancelled" },
    { id: 4, textBg: "purple", textColor: "purple", text: "P", taskName: "Product Development", statusbg: "teal", status: "on-going" },
    { id: 5, textBg: "danger", textColor: "danger", text: "L", taskName: "Logo Design", statusbg: "success", status: "Completed" },
]

//Latest Task
//todat
export const Latesttask = [
    { id: 1, label: "XML Import & Export", time: "12:00 PM", color: "primary", checked: true, active: "active" },
    { id: 2, label: "Database Optimization", time: "02:13 PM", color: "pink", checked: false, },
    { id: 3, label: "Create Wireframes", time: "06:20 PM", color: "success", checked: false, },
    { id: 4, label: "Develop MVP", time: "10:00 PM", color: "warning", checked: false, },
    { id: 5, label: "Design Ecommerce", time: "10:00 PM", color: "teal", checked: false, },
    { id: 6, label: "Fix Validation Issues", time: "12:00 AM", color: "purple", checked: false, }
]
// week
export const Latesttask2 = [
    { id: 1, label: "Management meeting", time: "06:30 AM", color: "teal", checked: false, },
    { id: 2, label: "Connect API to pages", time: "08:00 AM", color: "danger", checked: false, },
    { id: 3, label: "Icon change in Redesign App", time: "11:20 AM", color: "purple", checked: false, },
    { id: 4, label: "Test new features in tablets", time: "02:00 PM", color: "warning", checked: false, },
    { id: 5, label: "Design Logo", time: "04:00 PM", color: "success", checked: false, },
    { id: 6, label: "Project Launch", time: "06:00 PM", color: "primary", checked: false, }
];
//month
export const Latesttask3 = [
    { id: 1, label: "Design a Landing Page", time: "06:12 AM", color: "info", checked: false, },
    { id: 2, label: "Food Delivery Mobile Application", time: "03:00 PM", color: "danger", checked: false, },
    { id: 3, label: "Export Database values", time: "03:20 PM", color: "warning", checked: false, },
    { id: 4, label: "Write Simple Python Script", time: "04:00 PM", color: "pink", checked: false, },
    { id: 5, label: "Write Simple Angular Program", time: "05:00 PM", color: "success", checked: false, },
    { id: 6, label: "Design PSD files", time: "06:00 PM", color: "primary", checked: false, }
];


//All Projects
export const Allprojects = [
    { id: 1, name: "Angular Project", avatars: [face11, face12, face2], category: "Web Design", startDate: "01 Jan 2020", status: "Ongoing", endDate: "15 March 2020", badgeColor: "primary-gradient", },
    { id: 2, name: "PHP Project", avatars: [face16, face8, face7], category: "Web Development", startDate: "03 March 2020", status: "Ongoing", endDate: "15 Jun 2020", badgeColor: "success-gradient", },
    { id: 3, name: "Python", avatars: [face3, face12, face15], category: "Web Development", startDate: "15 March 2020", status: "Pending", endDate: "15 March 2020", badgeColor: "danger-gradient", },
    { id: 4, name: "Android App", avatars: [face7, face6, face16], category: "Android", startDate: "15 March 2020", status: "Ongoing", endDate: "15 March 2020", badgeColor: "success-gradient", },
    { id: 5, name: "Mobile Application", avatars: [face8, face11, face15], category: "Android", startDate: "15 March 2020", status: "Ongoing", endDate: "15 March 2020", badgeColor: "pink-gradient", }
]

//Top Ongoing Projects
export const Ongoingprojects = [
    { id: 1, title: "PSD Projects", date: "5 days ago", startDate: "17-02-2020", description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit...", statusClass: "text-danger", iconClass: "fa-caret-down" },
    { id: 2, title: "Wordpress Projects", date: "2 days ago", startDate: "15-02-2020", description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit..", statusClass: "text-success", iconClass: "fa-caret-up" },
    { id: 3, title: "HTML & CSS3 Projects", date: "1 day ago", startDate: "26-02-2020", description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit..", statusClass: "text-danger", iconClass: "fa-caret-down" },
    { id: 4, title: "HTML & CSS3 Projects", date: "1 day ago", startDate: "26-02-2020", description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit..", statusClass: "text-danger", iconClass: "fa-caret-down" }
]

//Activity
export const Activity = [
    { id: 1, image: face6, name: "Adam Berry", action: "Add a new projects", project: "AngularJS Template", time: "30 mins ago", projectClass: "text-pink", },
    { id: 2, image: face9, name: "Irene Hunter", action: "Add a new projects", project: "Free HTML Template", time: "1 day ago", projectClass: "text-danger", },
    { id: 3, image: face3, name: "John Payne", action: "Add a new projects", project: "Free PSD Template", time: "3 days ago", projectClass: "text-success", },
    { id: 4, image: face4, name: "Julia Hardacre", action: "Add a new projects", project: "Free UI Template", time: "5 days ago", projectClass: "text-warning", },
    { id: 5, image: face5, name: "Adam Berry", action: "Add a new projects", project: "AngularJS Template", time: "30 mins ago", projectClass: "text-pink", },
    { id: 6, image: face6, name: "Irene Hunter", action: "Add a new projects", project: "Free HTML Template", time: "1 day ago", projectClass: "text-purple", },
    { id: 7, image: face16, name: "John Payne", action: "Add a new projects", project: "Free PSD Template", time: "3 days ago", projectClass: "text-success", },
    { id: 8, image: face10, name: "Julia Hardacre", action: "Add a new projects", project: "Free UI Template", time: "5 days ago", projectClass: "", }
]
//Task Statistics
export const Tasktatistics = [
    { id: 1, icon: "far fa-dot-circle text-primary", title: "Completed Tasks", timeRange: "8:00am - 10:30am", count: 135, },
    { id: 2, icon: "far fa-dot-circle text-pink", title: "Inprogress Tasks", timeRange: "8:00am - 10:30am", count: 75, },
    { id: 3, icon: "far fa-dot-circle text-success", title: "On Hold Tasks", timeRange: "8:00am - 10:30am", count: 23, },
    { id: 4, icon: "far fa-dot-circle text-purple", title: "Pending Tasks", timeRange: "8:00am - 10:30am", count: 1, }
]