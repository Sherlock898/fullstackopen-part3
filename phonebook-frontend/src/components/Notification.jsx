const Notification = ({msg, className}) => {
    if(msg === null){
        return;
    }

    return (
        <div className={className}>
            {msg}
        </div>
    );
}

export default Notification;