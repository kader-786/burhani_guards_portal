import { Fragment, useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, InputGroup, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { connect } from "react-redux";
import { LocalStorageBackup } from '../components/common/switcher/switcherdata';
import { ThemeChanger } from "../redux/action";
import bgmi from "../assets/images/burhaniguards_logo1.png";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = ({ ThemeChanger }) => {
    const [passwordshow1, setpasswordshow1] = useState(false);
    const [err, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        "username": "",
        "password": "",
    });
    
    const { username, password } = data;
    
    const changeHandler = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
        setError("");
    };
    
    const navigate = useNavigate();
    
    const routeChange = () => {
        const path = `${import.meta.env.BASE_URL}dashboard`;
        navigate(path);
    };

    // Function to store user data in sessionStorage
    const storeUserSession = (userData, tokens) => {
        // Store only required user fields
        sessionStorage.setItem('its_id', userData.its_id?.toString() || '');
        sessionStorage.setItem('full_name', userData.full_name || '');
        sessionStorage.setItem('team_id', userData.team_id?.toString() || '');
        sessionStorage.setItem('position_id', userData.position_id?.toString() || '');
        sessionStorage.setItem('jamaat_id', userData.jamaat_id?.toString() || '');
        sessionStorage.setItem('jamaat_name', userData.jamaat_name || '');
        sessionStorage.setItem('role_id', userData.role_id?.toString() || '');
        sessionStorage.setItem('is_admin', userData.is_admin?.toString() || 'false');
        sessionStorage.setItem('access_rights', userData.access_rights || '');
        
        // Store access token
        sessionStorage.setItem('access_token', tokens.access_token || '');
        
        // Calculate and store expiry time (current time + expires_in seconds)
        const expiryTime = Date.now() + (tokens.expires_in * 1000);
        sessionStorage.setItem('session_expiry', expiryTime.toString());
        
        sessionStorage.setItem('isLoggedIn', 'true');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!username || !password) {
            setError("Please enter both username and password");
            return;
        }
        
        setLoading(true);
        setError("");
        
        try {
            const response = await fetch(
                // 'http://13.204.161.209:8080/BURHANI_GUARDS_API_TEST/api/Login/CheckLogin',
                `${API_BASE_URL}/Login/CheckLogin`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                    }),
                }
            );
            
            const result = await response.json();
            
            console.log('Login Response:', result);
            
            // Check if login was successful
            if (response.ok && result.success) {
                // Store user data and tokens in sessionStorage
                storeUserSession(result.data, result.tokens);
                
                // Navigate to dashboard on successful login
                routeChange();
            } else {
                // Handle error response
                setError(result.message || "Login failed. Please check your credentials.");
            }
        } catch (error) {
            console.error('Login Error:', error);
            setError("Network error. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        LocalStorageBackup(ThemeChanger);
        
        // If already logged in and session valid, redirect to dashboard
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        const sessionExpiry = sessionStorage.getItem('session_expiry');
        
        if (isLoggedIn && sessionExpiry) {
            const currentTime = Date.now();
            const expiryTime = parseInt(sessionExpiry, 10);
            
            if (currentTime < expiryTime) {
                routeChange();
            }
        }
    }, []);

    return (
        <Fragment>
            <div className="container">
                <div className="row justify-content-center align-items-center authentication authentication-basic vh-100 pt-3">
                    <Col xxl={4} xl={5} lg={5} md={6} sm={8} className="col-12">
                        <Card>
                            <div className="p-4">
                                <div className="d-flex justify-content-center mb-4">
                                    <Link to={`${import.meta.env.BASE_URL}dashboard`} className="d-flex align-items-center">
                                        <img src={bgmi} alt="logo" className="img-fluid rounded" style={{ maxWidth: '220px', height: 'auto' }} />
                                    </Link>
                                </div>
                                <Form onSubmit={handleLogin}>
                                    <div className="row gy-3">
                                        {err && <Alert variant="danger">{err}</Alert>}
                                        <Col xl={12}>
                                            {/* <Form.Label htmlFor="signin-username" className="form-label text-default">
                                                Username
                                            </Form.Label> */}
                                            <Form.Control 
                                                size="lg"
                                                placeholder="ITS ID"
                                                name="username"
                                                type="text"
                                                value={username}
                                                onChange={changeHandler}
                                                required
                                                disabled={loading}
                                            />
                                        </Col>
                                        <Col xl={12} className="mb-2">
                                            {/* <Form.Label htmlFor="signin-password" className="form-label text-default d-block">
                                                Password
                                            </Form.Label> */}
                                            <InputGroup>
                                                <Form.Control 
                                                    size="lg" 
                                                    className="form-control" 
                                                    placeholder="Password" 
                                                    name="password" 
                                                    type={passwordshow1 ? 'text' : 'password'} 
                                                    value={password} 
                                                    onChange={changeHandler} 
                                                    required 
                                                    disabled={loading}
                                                />
                                                <Button 
                                                    variant='light' 
                                                    className="btn btn-light" 
                                                    type="button" 
                                                    onClick={() => setpasswordshow1(!passwordshow1)}
                                                    id="button-addon2"
                                                    disabled={loading}
                                                >
                                                    <i className={`text-dark ${passwordshow1 ? 'ri-eye-line' : 'ri-eye-off-line'} align-middle`} aria-hidden="true"></i>
                                                </Button>
                                            </InputGroup>
                                        </Col>
                                        <Col xl={12} className="d-grid mt-2">
                                            <Button 
                                                variant='primary' 
                                                type="submit"
                                                size='lg' 
                                                className="btn"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <Spinner
                                                            as="span"
                                                            animation="border"
                                                            size="sm"
                                                            role="status"
                                                            aria-hidden="true"
                                                            className="me-2"
                                                        />
                                                        Signing In...
                                                    </>
                                                ) : (
                                                    'Login'
                                                )}
                                            </Button>
                                        </Col>
                                    </div>
                                </Form>
                            </div>
                        </Card>
                    </Col>
                </div>
            </div>
        </Fragment>
    );
};

const mapStateToProps = (state) => ({
    local_varaiable: state
});

export default connect(mapStateToProps, { ThemeChanger })(Login);