const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");
const nodemailer = require("nodemailer");
const claudinary = require("cloudinary").v2;

claudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
})

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    host: "smtp.example.com",
    port: 587,
    secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASS,
    },
});

const registerUser = async (req, res) => {
    const { firstname, lastname, email, password, tag } = req.body;
    try {
        if (!firstname || !lastname || !email || !password) {
            return res.status(400).send({ message: "Firstname, lastname, email, and password are required" });
        }

        const number = `${Math.ceil(Math.random() * 10000000)}`.padStart(7, "0")
        const generatedAccount = `Aug${number}`;

        const image = await cloudinary.uploader.upload(photo, {resource_type:"image"})

        const saltround = await bcryptjs.genSalt(10);
        const hashPass = await bcryptjs.hash(password, saltround);

        const user = await UserModel.create({
            firstname,
            lastname,
            email,
            tag,
            password: hashPass,
            accountNumber: generatedAccount,
            balance: user.balance,
            profilePicture:{
                secure_url:image.secure_url,
                public_id: image.public_id
            }

        });

        // const userAccount = await AccountModel.create({
        //     accountNumber:`Aug${number}`
        // })

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "2h", algorithm: "HS256" }
        );

        let mailOptions = {
            from: process.env.APP_EMAIL,
            bcc: 'myfriend@yahoo.com',
            subject: `Welcome to AugBank, ${firstname}`,
            text: `Welcome to August Bank where transaction is made easy, your account number is ${user.accountNumber}.`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.status(201).send({
            message: "User created successfully",
            data: {
                _id: user._id,
                firstname,
                lastname,
                email,
                role: user.role,
                tag: tag ? tag : null,
                accountNumber: generatedAccount,
                token,
                balance:user.balance,
                photo:user.profilePicture.secure_url
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).send({ message: "Email or tag already exists" });
        } else {
            res.status(400).send({ message: "User cannot be created at this time" });
        }
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).send({ message: "Email and password are required" });
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(401).send({ message: "Invalid email or password" });
        }

        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "10m", algorithm: "HS256" }
        );

        res.status(200).send({
            message: "Login successful",
            data: {
                _id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                tag: user.tag,
                token
            }
        });
    } catch (error) {
        res.status(500).send({ message: "Login failed" });
    }
};


const loginOperator = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).send({ message: "Email and password are required" });
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(401).send({ message: "Invalid email or password" });
        }

        if (user.role !== "operator" && user.role !== "admin") {
            return res.status(403).send({ message: "Access denied. Insufficient permissions." });
        }

        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "10m", algorithm: "HS256" }
        );

        res.status(200).send({
            message: "Login successful",
            data: {
                _id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                tag: user.tag,
                token
            }
        });
    } catch (error) {
        res.status(500).send({ message: "Login failed" });
    }
};




const getUser = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user._id).select("-password");
        res.status(200).send({
            message: "User retrieved successfully",
            data: user
        });
    } catch (error) {
        res.status(500).send({ message: "Could not retrieve user info" });
    }
};


const resolveAccount = async (req, res) => {
    const { accountNumber } = req.params
    try {
        const user = await UserModel.findOne({ accountNumber })
        if (!user) {
            return res.status(404).send({
                message: "cannot resolve account number"
            })
        }

        res.status(200).send({
            message: "account received",
            data: {
                accountname: user.firstname + " " + user.lastname,
                tag: user.tag ? user.tag : null,
            }
        })
    } catch (error) {
        console.log(error);

        return res.status(500).send({
            message: "cannot resolve account number"
        })
    }
}

const getUserByOperator = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).send({
                message: "User not found",
            });
        }

        res.status(200).send({
            message: "User retrieved successfully",
            data: user
        });
    } catch (error) {
        res.status(500).send({ message: "Could not retrieve user info" });
    }
};

const registerOperator = async (req, res) => {
    const { firstname, lastname, email, password, tag, role } = req.body;
    try {
        if (!firstname || !lastname || !email || !password) {
            return res.status(400).send({ message: "Firstname, lastname, email, and password are required" });
        }

        const saltround = await bcryptjs.genSalt(10);
        const hashPass = await bcryptjs.hash(password, saltround);

        const userRole = role && ["user", "operator", "admin"].includes(role) ? role : "user";

        const user = await UserModel.create({
            firstname, lastname, email, password: hashPass, tag, role: userRole
        });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "10m", algorithm: "HS256" }
        );

        res.status(201).send({
            message: "Account created successfully by operator",
            data: {
                _id: user._id,
                firstname,
                lastname,
                email,
                role: user.role,
                tag,
                token
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).send({ message: "Email or tag already exists" });
        } else {
            res.status(400).send({ message: "Account cannot be created at this time" });
        }
    }
};

const updateUser = async (req, res) => {
    const { id } = req.user;
    const { firstname, lastname } = req.body;

    try {
        if (req.user.role !== "operator" && req.user.role !== "admin") {
            return res.status(403).send({
                message: "Access denied"
            });
        }
        const allowedUpdate = {
            ...(firstname && { firstname: firstname.trim() }),
            ...(lastname && { lastname: lastname.trim() })
        }

        const updatedUser = await UserModel.findByIdAndUpdate(id, allowedUpdate, { returnDocument: "after", runValidators: true })

        if (!updatedUser) {
            return res.status(404).send({ message: "cannot update user at this time" });
        }

        res.status(200).send({
            message: "User updated successfully",
            data: updatedUser
        });
    } catch (error) {
        res.status(500).send({ message: "Failed to update user" });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUser,
    loginOperator,
    registerOperator,
    getUserByOperator,
    updateUser,
    resolveAccount
};
