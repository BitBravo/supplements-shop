$('document').ready(() => {

    const ordersTarget = $('#orders-chart');

    if (ordersTarget.length) {

        const
            ordersContext = ordersTarget[0].getContext('2d'),
            ordersChart = new Chart(ordersContext, {
                type: 'line',
                data: {
                    labels: ['January', 'February', 'Mars', 'April', 'May', 'June', 'Jule', 'August', 'Septembre', 'October', 'Novembre', 'Decembre'],
                    datasets: [{
                        label: 'Orders per month',
                        data: [10, 3, 6, 12, 7, 3, 15, 20, 22, 15, 10, 13],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });

        // Setting up the orders dropdown.
        $('.orders-dropdown-trigger').dropdown({
            constrainWidth: false,
            coverTrigger: false 
        });
    }
});
