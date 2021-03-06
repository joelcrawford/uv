import React, { Component } from 'react'

export default class UVComponent extends Component {

    uvEl;
    uv;
    uvstate;
    urlDataProvider;

    openManifest() {

        console.log('open sesamanifest')

        // show the UV (if hidden) and scroll into view
        this.uvEl.style.display = 'block';

        if (this.props.scrollIntoView) {
            this.uvEl.scrollIntoView();
        }

        this.uv.set(Object.assign({}, this.uvstate, {
            collectionIndex: 0,
            manifestIndex: 0,
            sequenceIndex: 0,
            canvasIndex: 0
        }));
    }

    componentWillMount() {
        console.log('mounting, from app...', this.props)
        // prevent server-side compilation error
        if (typeof window === 'undefined') {
            return;
        }

        var that = this;

        window.addEventListener('uvLoaded', function (e) {

            that.urlDataProvider = new window.UV.URLDataProvider();

            that.uvstate = {
                root: that.props.root,
                configUri: that.props.configUri,
                locales: [{ name: 'en-GB' }],
                iiifResourceUri: that.props.manifest,
                collectionIndex: Number(that.urlDataProvider.get('c', 0)),
                manifestIndex: Number(that.urlDataProvider.get('m', 0)),
                sequenceIndex: Number(that.urlDataProvider.get('s', 0)),
                canvasIndex: Number(that.urlDataProvider.get('cv', 0)),
                rotation: Number(that.urlDataProvider.get('r', 0)),
                xywh: that.urlDataProvider.get('xywh', '')
            }

            console.log('uvloaded with ', that.uvstate)
        
            that.uvEl = document.querySelector('#' + that.props.id || '#uv');
            that.uv = window.createUV(that.uvEl, that.uvstate, that.urlDataProvider);

            // is on created like when it first loads? with no manifest hash param?
            that.uv.on('created', function () {
                console.log('created with', that.uvstate)
                window.Utils.Urls.setHashParameter('manifest', that.props.manifest) // that.uvstate.iiifResourceUri
            });

            // are there uv hash parameters?
            that.uvstate.iiifResourceUri = window.Utils.Urls.getHashParameter('manifest');

            // console.log('post hash param', that.uvstate)
            if (that.uvstate.iiifResourceUri) {
                that.openManifest();
            }
        
        }, false);
    }

    componentWillReceiveProps(nextProps) {
        console.log('next props', nextProps)
        // if it's not the initial props, and a manifest has been set, and the current manifest isn't the next one (fix for IE recursion bug)
        if (this.uvstate && nextProps.manifest && this.uvstate.iiifResourceUri !== nextProps.manifest) {
            this.uvstate.iiifResourceUri = nextProps.manifest;
            this.openManifest();
        }
    }

    render() {
		return (
			<div id="uv" class="uv"></div>
        )
    }

}