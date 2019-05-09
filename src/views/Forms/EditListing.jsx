import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { compose } from "redux";
import { Route } from "react-router-dom";
import PropertiesPage from "../../views/Properties/Properties";
import Button from "../../components/CustomButtons/Button.jsx";
import GridContainer from "../../components/Grid/GridContainer";
import GridItem from "../../components/Grid/GridItem";
import { pushToFirebase } from "../../reference/firebase/index";
import {
  Chip,
  Snackbar,
  IconButton,
  Typography,
  List,
  ListItem,
  Checkbox,
  ListItemText,
  Paper,
  TextField,
  CircularProgress
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import ClearIcon from "@material-ui/icons/Clear";
import AddPhotoAlternateIcon from "@material-ui/icons/AddPhotoAlternate";
import CustomUploadButton from "react-firebase-file-uploader/lib/CustomUploadButton";
import { Map, GoogleApiWrapper } from "google-maps-react";
import firebase, { pullFromFirebase } from "../../reference/firebase";
import placeholderImg from "../../assets/img/placeholderImg.jpg";

const defaultState = {
  name: "",
  address: "",
  desc: "",
  rules: "",
  price: "",
  type: "",
  status: "",
  rooms: "",
  pic: "",
  owner: {}
};

class EditListing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...defaultState,
      snackbarOpen: false,
      progress: 0,
      isUploading: false,
      rulesList: [],
      selectedRules: []
    };
  }

  componentDidMount = () => {
    pullFromFirebase("rules", snapshot => {
      let rules = [];
      snapshot.forEach(item => {
        rules.push(item.val());
      });
      this.setState({
        rulesList: rules
      });
    });
  };

  inputChange = e => {
    const id = e.target.id;
    const value = e.target.value;
    this.setState({
      [id]: value
    });
  };

  handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    this.setState({ snackbarOpen: false });
  };

  submitForm = e => {
    e.preventDefault();
    const currentUser = firebase.auth().currentUser;
    // excluding other state elements
    const { snackbarOpen, process, isUploading, ...curState } = this.state;
    pushToFirebase("listings", {
      ...curState,
      owner: {
        displayName: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL,
        uid: currentUser.uid
      }
    });
    this.setState({ ...defaultState, snackbarOpen: true });
    return <Route path={"/admin/properties"} component={PropertiesPage} />;
  };

  clearForm = e => {
    this.setState({ ...defaultState, snackbarOpen: false });
  };

  initAutocomplete = mapProps => {
    const { google } = mapProps;
    this.autoComplete = new google.maps.places.Autocomplete(
      document.getElementById("address")
    );
    this.autoComplete.setFields(["geometry", "formatted_address"]);
    this.autoComplete.addListener("place_changed", () => {
      const place = this.autoComplete.getPlace();
      this.setState({
        address: place.formatted_address
      });
      document.getElementById("address").value = place.formatted_address;
      if (place.geometry) {
        // TODO: change the state accordingly
      }
    });
  };

  // https://www.npmjs.com/package/react-firebase-file-uploader
  handleUploadStart = () => this.setState({ isUploading: true, progress: 0 });
  handleProgress = progress => this.setState({ progress: progress });
  handleUploadError = error => {
    this.setState({ isUploading: false });
    console.error(error);
  };
  handleUploadSuccess = filename => {
    this.setState({ progress: 100, isUploading: false });
    firebase
      .storage()
      .ref("images")
      .child(filename)
      .getDownloadURL()
      .then(url => this.setState({ pic: url }));
  };

  handleDeleteChip = data => () => {
    const rules = [...this.state.selectedRules];
    const ruleToDelete = rules.indexOf(data);
    rules.splice(ruleToDelete, 1);

    this.setState({
      selectedRules: rules
    });
  };

  ruleChips = () => {
    return this.state.selectedRules.map(data => {
      let icon = null;

      if (data === "No pets") {
        icon = <ClearIcon />;
      }

      return (
        <Chip
          icon={icon}
          key={data}
          label={data}
          onDelete={this.handleDeleteChip(data)}
        />
      );
    });
  };

  // https://material-ui.com/demos/selects/

  handleToggle = value => () => {
    const { selectedRules } = this.state;
    const currentIndex = selectedRules.indexOf(value);
    const newChecked = [...selectedRules];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    this.setState({
      selectedRules: newChecked
    });
  };

  rulesBox = () => (
    <List>
      {this.state.rulesList.map(rule => (
        <ListItem
          key={rule}
          value={rule}
          button
          onClick={this.handleToggle(rule)}
        >
          <Checkbox checked={this.state.selectedRules.indexOf(rule) > -1} />
          <ListItemText primary={rule} />
        </ListItem>
      ))}
    </List>
  );
  // https://material-ui.com/demos/snackbars/
  snackBar = () => {
    return (
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right"
        }}
        open={this.state.snackbarOpen}
        autoHideDuration={6000}
        onClose={this.handleClose}
        ContentProps={{
          "aria-describedby": "message-id"
        }}
        message={<span id="message-id">Listing updated!</span>}
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            onClick={this.handleClose}
          >
            <CloseIcon />
          </IconButton>
        ]}
      />
    );
  };

  paperStyles = theme => ({
    root: {
      ...theme.mixins.gutters(),
      paddingTop: theme.spacing.unit * 2,
      paddingBottom: theme.spacing.unit * 2
    }
  });

  render() {
    console.log(this.state.rulesList);
    return (
      <>
        {!this.props.isSignedIn ? (
          <h2>Please sign in!</h2>
        ) : (
          <Paper style={{ width: '90%', maxWidth: '80ch', margin: '0 auto' }} elevation={1}>
            <form onSubmit={this.submitForm} autoComplete="off">
              {this.snackBar()}
              <br />
              <Typography variant="h3" style={{marginBottom: '.5em', padding: '0 1ch'}}>Listing Image</Typography>
              {/* https://www.npmjs.com/package/react-firebase-file-uploader */}
                  {this.state.pic ? (
                    <img
                      style={{ width: "100%", height: "auto" }}
                      src={this.state.pic}
                      alt={`${firebase.auth().currentUser.displayName} listing`}
                    />
                  ) : this.state.isUploading ? (
                        <CircularProgress color="secondary" style={{margin: '20ch auto', display: 'block'}}/> 
                       ) : (
                    <img
                      style={{ width: "100%", height: "auto" }}
                      src={placeholderImg}
                      alt={`${firebase.auth().currentUser.displayName} listing`}
                    />
                  )}
                  <GridContainer style={{padding: '1ch'}} spacing={40}>
                <GridItem xs={12}>
                  <Button
                    color="primary"
                    component={CustomUploadButton}
                    hidden
                    accept="image/*"
                    name="listing"
                    randomizeFilename
                    storageRef={firebase.storage().ref("images")}
                    onUploadStart={this.handleUploadStart}
                    onUploadError={this.handleUploadError}
                    onUploadSuccess={this.handleUploadSuccess}
                    onProgress={this.handleProgress}
                    style={{width: '100%'}}
                  >
                    <AddPhotoAlternateIcon />
                    Add a Photo of Your Listing
                  </Button>
                </GridItem>

                <GridItem xs={12}>
                  <TextField
                    label="Name"
                    id="name"
                    formControlProps={{
                      fullWidth: true
                    }}
                    value={this.state.name}
                    onChange={this.inputChange}
                    style={{width: '100%'}}
                  />
                </GridItem>
                <GridItem xs={12} sm={6}>
                  <TextField
                    label="Address"
                    id="address"
                    formControlProps={{
                      fullWidth: true
                    }}
                    onChange={this.inputChange}
                    value={this.state.address}
                    style={{width: '100%'}}
                  />
                </GridItem>
                <GridItem xs={12} sm={6}>
                  <TextField
                    label="Description"
                    id="desc"
                    formControlProps={{
                      fullWidth: true
                    }}
                    onChange={this.inputChange}
                    value={this.state.desc}
                    style={{width: '100%'}}
                  />
                </GridItem>

                <GridItem xs={12}>
                  <Typography variant="h5">Rules</Typography>
                  {this.ruleChips()}
                  {this.rulesBox()}
                  <TextField
                    label="Rules"
                    id="rules"
                    formControlProps={{
                      fullWidth: true
                    }}
                    onChange={this.inputChange}
                    value={this.state.rules}
                    style={{width: '100%'}}

                  />
                </GridItem>
                <GridItem xs={12}>
                  <TextField
                    label="Price"
                    id="price"
                    formControlProps={{
                      fullWidth: true
                    }}
                    onChange={this.inputChange}
                    value={this.state.price}
                    style={{width: '100%'}}

                  />
                </GridItem>
                <GridItem xs={12} sm={6}>
                  <TextField
                    label="Type"
                    id="type"
                    formControlProps={{
                      fullWidth: true
                    }}
                    onChange={this.inputChange}
                    value={this.state.type}
                    style={{width: '100%'}}

                  />
                </GridItem>
                <GridItem xs={12} sm={6}>
                  <TextField
                    label="Rooms"
                    id="rooms"
                    formControlProps={{
                      fullWidth: true
                    }}
                    onChange={this.inputChange}
                    value={this.state.rooms}
                    style={{width: '100%'}}

                  />
                </GridItem>
                <GridItem xs={12} sm={6}>
                  <Button color="primary" type="submit"  style={{width: '100%'}}>
                    Add Property
                  </Button>
                </GridItem>
                <GridItem xs={12} sm={6}>
                  <Button color="info" onClick={this.clearForm} style={{width: '100%'}}>
                    <ClearIcon /> Clear All
                  </Button>
                </GridItem>
              </GridContainer>
            </form>
            <Map
              google={this.props.google}
              onClick={this.props.google}
              visible={false}
              onReady={this.initAutocomplete}
              style={{ width: "0", height: "0", display: 'none', visiblity: 'hidden'}}
            />
          </Paper>
        )}
      </>
    );
  }
}

AddListing.propTypes = {
  isSignedIn: PropTypes.bool.isRequired
};
const mapStateToProps = state => ({
  isSignedIn: state.signInState.isSignedIn
});

export default compose(
  GoogleApiWrapper({
    apiKey: process.env.REACT_APP_MAP_API_KEY
  }),
  connect(mapStateToProps)
)(AddListing);