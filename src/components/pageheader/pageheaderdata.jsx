import React, { Component } from "react";
import Chart from "react-apexcharts";
//Profit bar
export class Profit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            series: [
                {
                    name: "Sales",
                    data: [2, 4, 3, 4, 5, 4, 5, 3, 4],
                }
            ],
            options: {
                chart: {
                    type: 'bar',
                    height: 30,
                    width: 80,
                    toolbar: {
                        show: false,
                    },
                    sparkline: {
                        enabled: true
                    },
                },
                dataLabels: {
                    enabled: false,
                },
                xaxis: {
                    labels: {
                        show: false,
                    },
                    axisBorder: {
                        show: false,
                    },
                },
                yaxis: {
                    labels: {
                        show: false,
                    },
                    axisBorder: {
                        show: false,
                    },
                },
                grid: {
                    show: false,
                },
                colors: ['#eb5da4'],
            }
        }
    }
    render() {
        return (
            <div>
                <Chart options={this.state.options} series={this.state.series} type="bar" height={30} width={80} />
            </div>
        );
    }
}
//Expenses
export class Expenses extends Component {
    constructor(props) {
        super(props);
        this.state = {
            series: [
                {
                    name: "Sales",
                    data: [2, 4, 3, 4, 5, 4, 5, 3, 4],
                }
            ],
            options: {
                chart: {
                    type: 'bar',
                    height: 30,
                    width: 80,
                    toolbar: {
                        show: false,
                    },
                    sparkline: {
                        enabled: true
                    },
                },
                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: '50%',
                        colors: {
                            ranges: [{
                                from: 9,
                                to: 9,
                                color: '#00D1A2',
                            }],
                            backgroundBarColors: [],
                            backgroundBarOpacity: 1,
                        },
                    },
                },
                dataLabels: {
                    enabled: false,
                },
                xaxis: {
                    labels: {
                        show: false,
                    },
                    axisBorder: {
                        show: false,
                    },
                },  
                tooltip: {
                    enabled: false,
                },
                yaxis: {
                    labels: {
                        show: false,
                    },
                    axisBorder: {
                        show: false,
                    },
                },
                grid: {
                    show: false,
                },
                colors: ['#00D1A2'],
            }
        }
    }
    render() {
        return (
            <div>
                <Chart options={this.state.options} series={this.state.series} type="bar" height={30} width={80} />
            </div>
        );
    }
}