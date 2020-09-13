import { useState } from 'react';
import axios from 'axios';

export default ({ url, method, body, onSuccess }) => {
    const [errors, setErrors] = useState(null);

    const makeRequest = async () => {
        try {
            setErrors(null);
            const res = await axios[method](url, body);

            if(onSuccess) {
                onSuccess();
            }

            return res.data;
        } catch(err) {
            setErrors(
                <div className="alert alert-danger">
                    <ul className="my-0">
                        {err.response.data.errors.map(err => 
                            (<li key={err.message}>{err.message}</li>)
                        )}
                    </ul>
                </div>
            );
        }
    };

    return { makeRequest, errors };
};